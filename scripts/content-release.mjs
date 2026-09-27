import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { digest, renderLearningModule, validatePack } from './content-rules.mjs';

const root = process.env.ACADEMY_CONTENT_ROOT ? resolve(process.env.ACADEMY_CONTENT_ROOT) : fileURLToPath(new URL('../', import.meta.url));
const content = join(root, 'content');
const activePath = join(content, 'active.json');
const modulePath = join(root, 'learning-content.js');
const [command, id, actorOrRelease] = process.argv.slice(2);
const slug = (value) => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{2,63}$/.test(value);
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const save = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const fail = (message) => { throw new Error(message); };
const packPath = (folder, name) => join(content, folder, `${name}.json`);
const reviewPath = (name) => join(content, 'reviews', `${name}.json`);
const active = () => read(activePath);
const checkedPack = (path) => {
  const pack = read(path);
  const errors = validatePack(pack);
  if (errors.length) fail(`Content validation failed:\n${errors.map((item) => `- ${item}`).join('\n')}`);
  return pack;
};
const publishModule = (pack) => writeFileSync(modulePath, renderLearningModule(pack), 'utf8');
const appendHistory = (previous, entry) => ({ ...previous, activeRelease: entry.releaseId, activeDigest: entry.digest, history: [...previous.history, entry] });

switch (command) {
  case 'verify': {
    const state = active();
    const pack = checkedPack(packPath('releases', state.activeRelease));
    if (digest(pack) !== state.activeDigest) fail('Published release checksum differs from active manifest');
    if (readFileSync(modulePath, 'utf8') !== renderLearningModule(pack)) fail('learning-content.js differs from the published release');
    if (!Array.isArray(state.history) || state.history.at(-1)?.releaseId !== state.activeRelease) fail('Release history is inconsistent');
    console.log(`Verified ${state.activeRelease} (${state.activeDigest.slice(0, 12)})`);
    break;
  }
  case 'status': {
    const state = active();
    console.log(`Active: ${state.activeRelease} (${state.activeDigest.slice(0, 12)})`);
    console.log(`History: ${state.history.length} releases/rollbacks`);
    break;
  }
  case 'start': {
    if (!slug(id) || !actorOrRelease?.trim()) fail('Usage: content-release start <draft-id> <author>');
    const target = packPath('drafts', id);
    if (existsSync(target) || existsSync(reviewPath(id))) fail('Draft already exists');
    mkdirSync(join(content, 'drafts'), { recursive: true });
    mkdirSync(join(content, 'reviews'), { recursive: true });
    copyFileSync(packPath('releases', active().activeRelease), target);
    save(reviewPath(id), { draftId: id, author: actorOrRelease.trim(), baseRelease: active().activeRelease, state: 'draft', createdAt: new Date().toISOString() });
    console.log(`Draft created: ${target}`);
    break;
  }
  case 'review': {
    if (!slug(id) || !actorOrRelease?.trim()) fail('Usage: content-release review <draft-id> <reviewer>');
    const record = read(reviewPath(id));
    if (record.author.toLowerCase() === actorOrRelease.trim().toLowerCase()) fail('Reviewer must differ from draft author');
    const pack = checkedPack(packPath('drafts', id));
    save(reviewPath(id), { ...record, state: 'reviewed', reviewedBy: actorOrRelease.trim(), reviewedAt: new Date().toISOString(), reviewedDigest: digest(pack) });
    console.log(`Reviewed ${id}: ${digest(pack).slice(0, 12)}`);
    break;
  }
  case 'publish': {
    if (!slug(id) || !slug(actorOrRelease)) fail('Usage: content-release publish <draft-id> <release-id>');
    const record = read(reviewPath(id));
    const pack = checkedPack(packPath('drafts', id));
    if (record.state !== 'reviewed' || record.reviewedDigest !== digest(pack)) fail('Draft changed after review; review it again');
    if (record.baseRelease !== active().activeRelease) fail('Active release changed; rebase the draft before publishing');
    const target = packPath('releases', actorOrRelease);
    if (existsSync(target)) fail('Release ID already exists');
    if (digest(pack) === active().activeDigest) fail('Draft is identical to the active release');
    mkdirSync(join(content, 'releases'), { recursive: true });
    copyFileSync(packPath('drafts', id), target);
    const entry = { action: 'publish', releaseId: actorOrRelease, digest: digest(pack), from: active().activeRelease, sourceDraft: id, reviewedBy: record.reviewedBy, at: new Date().toISOString() };
    publishModule(pack);
    save(activePath, appendHistory(active(), entry));
    console.log(`Published ${actorOrRelease}. Commit the release, manifest, and generated module together.`);
    break;
  }
  case 'rollback': {
    if (!slug(id)) fail('Usage: content-release rollback <existing-release-id>');
    const state = active();
    if (id === state.activeRelease) fail('Release is already active');
    const pack = checkedPack(packPath('releases', id));
    const entry = { action: 'rollback', releaseId: id, digest: digest(pack), from: state.activeRelease, at: new Date().toISOString() };
    publishModule(pack);
    save(activePath, appendHistory(state, entry));
    console.log(`Rolled back to ${id}. Commit the manifest and generated module together.`);
    break;
  }
  default:
    fail('Commands: verify | status | start <draft-id> <author> | review <draft-id> <reviewer> | publish <draft-id> <release-id> | rollback <release-id>');
}
