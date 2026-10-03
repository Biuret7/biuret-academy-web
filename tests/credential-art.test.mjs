import test from 'node:test';
import assert from 'node:assert/strict';
import { credentialFacts, downloadCredential, validCredentialRecord } from '../credential-art.js';

test('public verification accepts current and legacy credential versions only for known paths', () => {
  for (const version of ['foundations-v1', 'foundations-v2']) assert.equal(validCredentialRecord({ version, pathId: 'foundations' }), true);
  for (const version of ['program-path-v1', 'program-path-v2']) assert.equal(validCredentialRecord({ version, pathId: 'path_grc' }), true);
  for (const pathId of ['path_appsec', 'path_mobile', 'path_threat_intel', 'path_malware']) assert.equal(validCredentialRecord({ version: 'program-path-v2', pathId }), true);
  assert.equal(validCredentialRecord({ version: 'program-path-v2', pathId: 'foundations' }), false);
  assert.equal(validCredentialRecord({ version: 'program-path-v3', pathId: 'path_grc' }), false);
});

test('certificate facts describe the learning path and retain existing credential IDs', () => {
  const id = `c_${'a'.repeat(32)}`;
  const issuedAt = '2026-09-29T08:51:00.000Z';
  const foundation = credentialFacts({ id, pathId: 'foundations', issuedAt, score: 9, total: 10 }, 'en');
  assert.equal(foundation.title, 'Cybersecurity Foundations');
  assert.equal(foundation.courses, 3);
  assert.equal(foundation.lessons, 9);
  assert.equal(foundation.score, '9 / 10');
  assert.equal(foundation.verifyUrl, `https://academy.biuret.dev/certificate.html?id=${id}`);
  const path = credentialFacts({ id, pathId: 'path_soc', issuedAt, courseCount: 4, lessonCount: 18, score: 8 }, 'ar');
  assert.equal(path.title, 'تحليل SOC');
  assert.equal(path.courses, 4);
  assert.equal(path.lessons, 18);
  assert.match(path.topics, /السجلات/);
});

test('downloads PDF, PNG and JPEG without an external service', async () => {
  const previousDocument = globalThis.document;
  const previousCreate = URL.createObjectURL;
  const previousRevoke = URL.revokeObjectURL;
  const previousTimeout = globalThis.setTimeout;
  const saved = [];
  const context = { fillRect() {}, strokeRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fillText() {},
    createRadialGradient: () => ({ addColorStop() {} }), measureText: (text) => ({ width: text.length * 12 }) };
  globalThis.document = { fonts: { ready: Promise.resolve() }, body: { append() {} }, createElement: (tag) => tag === 'canvas'
    ? { width: 0, height: 0, getContext: () => context, toDataURL: () => 'data:image/jpeg;base64,/9j/2Q==', toBlob: (callback, type) => callback(new Blob(['image'], { type })) }
    : { click() { saved.push(this.download); }, remove() {} } };
  URL.createObjectURL = (blob) => { saved.push(blob); return 'blob:certificate-test'; };
  URL.revokeObjectURL = () => {};
  globalThis.setTimeout = () => 0;
  const credential = { id: `c_${'b'.repeat(32)}`, holderName: 'Real Learner', status: 'active', pathId: 'foundations', issuedAt: '2026-09-29T08:51:00.000Z', score: 9 };
  try {
    for (const format of ['pdf', 'png', 'jpeg']) await downloadCredential(credential, 'en', format);
    assert.deepEqual(saved.filter((item) => typeof item === 'string'), [
      `Biuret-Academy-${credential.id}.pdf`, `Biuret-Academy-${credential.id}.png`, `Biuret-Academy-${credential.id}.jpg`,
    ]);
    const blobs = saved.filter((item) => item instanceof Blob);
    assert.deepEqual(blobs.map((item) => item.type), ['application/pdf', 'image/png', 'image/jpeg']);
    const pdf = new TextDecoder('latin1').decode(await blobs[0].arrayBuffer());
    assert.match(pdf, /^%PDF-1\.4/);
    assert.match(pdf, /\/Subtype \/Image/);
    assert.match(pdf, /%%EOF$/);
    assert.equal(Number(pdf.match(/startxref\n(\d+)/)[1]), pdf.indexOf('xref\n'));
  } finally {
    globalThis.document = previousDocument;
    URL.createObjectURL = previousCreate;
    URL.revokeObjectURL = previousRevoke;
    globalThis.setTimeout = previousTimeout;
  }
});
