import { createHash } from 'node:crypto';
import { isAcademyAdmin } from './admin.js';
import { additionalPathIds } from './additional-paths.js';

const PATHS = ['foundations', 'path_pentest', 'path_soc', 'path_dfir', 'path_cloud', 'path_grc', ...additionalPathIds];
const FIELDS = ['evidence', 'reasoning', 'limits', 'retest'];
const VERSION = 'report-review-v1';
const MAX_REVISIONS = 20;
const digest = value => createHash('sha256').update(value).digest('hex').slice(0, 32);
export const reportId = (userId, pathId, revision) => `s_${digest(`${VERSION}:${userId}:${pathId}:${revision}`)}`;
const reviewId = id => `v_${digest(`${VERSION}:${id}`)}`;
const fail = (message, status = 503) => Object.assign(new Error(message), { status });
const query = (method, attribute, values) => JSON.stringify({ method, ...(attribute ? { attribute } : {}), ...(values ? { values } : {}) });

export function validateReport(fields) {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return null;
  const cleaned = {};
  for (const field of FIELDS) {
    if (typeof fields[field] !== 'string') return null;
    const value = fields[field].trim();
    if (value.length < 20 || value.length > 4000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) return null;
    cleaned[field] = value;
  }
  return Buffer.byteLength(JSON.stringify(cleaned), 'utf8') <= 60000 ? cleaned : null;
}

export function reportReviewService({ base, request, table = process.env.ACADEMY_REPORTS_TABLE_ID || '', now = () => new Date() }) {
  const enabled = /^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,35}$/.test(table);
  const rows = `${base}/tablesdb/6aa56477002e28054068/tables/${table}/rows`;
  const ready = () => { if (!enabled) throw fail('Report review is not configured'); };
  const admin = account => { if (!isAcademyAdmin(account)) throw fail('Academy admin access required', 403); ready(); };
  const path = id => { if (!PATHS.includes(id)) throw fail('Path not found', 404); };
  async function read(id) {
    const result = await request(`${rows}/${id}`);
    if (result.status === 404) return null;
    if (result.status !== 200) throw fail('Report lookup unavailable');
    return result.data;
  }
  function decode(row) {
    const data = JSON.parse(row.payload);
    if (data.version !== VERSION || data.userId !== row.userId || data.pathId !== row.pathId || data.revision !== row.revision || data.kind !== row.kind ||
      !PATHS.includes(data.pathId) || !Number.isInteger(data.revision) || data.revision < 1 || data.revision > MAX_REVISIONS ||
      (row.kind === 'submission' ? row.$id !== reportId(row.userId, row.pathId, row.revision) || !validateReport(data.fields) :
        row.kind !== 'review' || row.$id !== reviewId(data.reportId) || data.reportId !== reportId(row.userId, row.pathId, row.revision) || !['accepted', 'changes_requested'].includes(data.decision) ||
        !data.scores || FIELDS.some(field => !Number.isInteger(data.scores[field]) || data.scores[field] < 0 || data.scores[field] > 2) || typeof data.feedback !== 'string' || data.feedback.length > 2000)) throw fail('Report record invalid');
    return { ...data, id: row.$id, createdAt: row.$createdAt };
  }
  async function list(queries) {
    const result = await request(`${rows}?${queries.map(q => `queries[]=${encodeURIComponent(q)}`).join('&')}`);
    if (result.status !== 200 || !Array.isArray(result.data.rows)) throw fail('Report history unavailable');
    return result.data.rows.map(decode);
  }
  async function latest(userId, pathId) {
    return (await list([query('equal', 'userId', [userId]), query('equal', 'pathId', [pathId]), query('equal', 'kind', ['submission']), query('orderDesc', 'revision'), query('limit', null, [1])]))[0] || null;
  }
  async function reviewOf(submission) {
    const row = await read(reviewId(submission.id));
    return row ? decode(row) : null;
  }
  function publicReview(review) {
    return review && { decision: review.decision, scores: review.scores, feedback: review.feedback, reviewerName: review.reviewerName, createdAt: review.createdAt };
  }
  function publicSubmission(submission, review) {
    return { id: submission.id, revision: submission.revision, pathId: submission.pathId, language: submission.language, fields: submission.fields, createdAt: submission.createdAt,
      status: review?.decision || 'pending', review: publicReview(review) };
  }
  async function state(userId, pathId) {
    path(pathId);
    if (!enabled) return { enabled: false, current: null, history: [] };
    const submissions = await list([query('equal', 'userId', [userId]), query('equal', 'pathId', [pathId]), query('equal', 'kind', ['submission']), query('orderDesc', 'revision'), query('limit', null, [MAX_REVISIONS])]);
    const current = submissions[0];
    if (!current) return { enabled: true, current: null, history: [], nextRevision: 1 };
    if (current.userId !== userId) throw fail('Report ownership mismatch', 403);
    if (submissions.length !== current.revision || submissions.some((item,index) => item.userId !== userId || item.pathId !== pathId || item.revision !== current.revision - index)) throw fail('Report history incomplete');
    const history = await Promise.all(submissions.map(async submission => publicSubmission(submission, await reviewOf(submission))));
    return { enabled: true, current: history[0], history, nextRevision: current.revision + 1 };
  }
  async function submit(account, input, eligible) {
    ready(); path(input.pathId);
    if (!eligible) throw fail('Complete path lessons and course exams first', 403);
    if (input.consent !== true) throw fail('Report submission consent required', 400);
    const fields = validateReport(input.fields);
    if (!fields || !['ar', 'en'].includes(input.language)) throw fail('Complete report fields with 20–4000 characters', 400);
    if (!Number.isInteger(input.baseRevision) || input.baseRevision < 0 || input.baseRevision >= MAX_REVISIONS) throw fail('Invalid report revision', 400);
    const previous = await latest(account.$id, input.pathId);
    const base = previous?.revision || 0;
    if (base !== input.baseRevision) {
      if (base === input.baseRevision + 1 && previous.language === input.language && JSON.stringify(previous.fields) === JSON.stringify(fields)) return state(account.$id, input.pathId);
      throw fail('Report changed; reload before submitting', 409);
    }
    if (previous && (await reviewOf(previous))?.decision !== 'changes_requested') throw fail('Wait for review before resubmitting', 409);
    const revision = base + 1;
    const data = { version: VERSION, kind: 'submission', userId: account.$id, holderName: account.name, pathId: input.pathId, revision, language: input.language, fields,
      consent: true, consentVersion: 'private-review-v1', submittedAt: now().toISOString() };
    const result = await request(rows, { method: 'POST', body: JSON.stringify({ rowId: reportId(account.$id, input.pathId, revision), data: { userId: account.$id, pathId: input.pathId, revision, kind: 'submission', occurredAt: data.submittedAt, payload: JSON.stringify(data) }, permissions: [] }) });
    if (result.status === 409) {
      const saved = decode(await read(reportId(account.$id, input.pathId, revision)));
      if (saved.language !== data.language || JSON.stringify(saved.fields) !== JSON.stringify(fields)) throw fail('Report changed; reload before submitting', 409);
    } else if (result.status !== 201) throw fail('Report submission unavailable');
    return state(account.$id, input.pathId);
  }
  async function detail(account, id) {
    admin(account);
    if (!/^s_[a-f0-9]{32}$/.test(id || '')) throw fail('Invalid report ID', 400);
    const row = await read(id);
    if (!row) throw fail('Report not found', 404);
    const submission = decode(row), review = await reviewOf(submission), current = await latest(submission.userId, submission.pathId);
    return { ...publicSubmission(submission, review), holderName: submission.holderName, userId: submission.userId, current: current?.id === id, selfReview: submission.userId === account.$id };
  }
  async function queue(account, cursor) {
    admin(account);
    if (cursor && !/^s_[a-f0-9]{32}$/.test(cursor)) throw fail('Invalid report cursor', 400);
    const queries = [query('equal', 'kind', ['submission']), query('orderDesc', 'occurredAt'), query('limit', null, [10])];
    if (cursor) queries.push(query('cursorAfter', null, [cursor]));
    const submissions = await list(queries);
    const items = await Promise.all(submissions.map(item => detail(account, item.id)));
    return { items: items.map(({fields, review, ...summary}) => summary), nextCursor: items.length === 10 ? items.at(-1).id : null };
  }
  async function decide(account, input) {
    const found = await detail(account, input.reportId);
    if (found.selfReview) throw fail('A reviewer cannot review their own report', 403);
    if (!found.current) throw fail('Report changed; reload before reviewing', 409);
    if (!['accepted', 'changes_requested'].includes(input.decision) || typeof input.feedback !== 'string' || input.feedback.trim().length < 20 || input.feedback.length > 2000 ||
      !input.scores || FIELDS.some(field => !Number.isInteger(input.scores[field]) || input.scores[field] < 0 || input.scores[field] > 2)) throw fail('Provide a decision, four scores and 20–2000 character feedback', 400);
    const scores = Object.fromEntries(FIELDS.map(field => [field, input.scores[field]]));
    if (input.decision === 'accepted' && (Object.values(scores).some(score => score === 0) || Object.values(scores).reduce((a, b) => a + b, 0) < 6)) throw fail('Accepted reports need at least 6/8 with no zero criterion', 400);
    const data = { version: VERSION, kind: 'review', userId: found.userId, pathId: found.pathId, revision: found.revision, reportId: found.id,
      decision: input.decision, scores, feedback: input.feedback.trim(), reviewerId: account.$id, reviewerName: account.name, reviewedAt: now().toISOString() };
    const result = await request(rows, { method: 'POST', body: JSON.stringify({ rowId: reviewId(found.id), data: { userId: found.userId, pathId: found.pathId, revision: found.revision, kind: 'review', occurredAt: data.reviewedAt, payload: JSON.stringify(data) }, permissions: [] }) });
    if (result.status === 409) {
      const saved = decode(await read(reviewId(found.id)));
      if (saved.reviewerId !== account.$id || saved.decision !== data.decision || saved.feedback !== data.feedback || JSON.stringify(saved.scores) !== JSON.stringify(scores)) throw fail('Report already reviewed; reload to see the decision', 409);
    } else if (result.status !== 201) throw fail('Report review unavailable');
    return detail(account, found.id);
  }
  return { state, submit, queue, detail, decide };
}
