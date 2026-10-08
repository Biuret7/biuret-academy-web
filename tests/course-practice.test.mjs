import test from 'node:test';
import assert from 'node:assert/strict';
import { coursePracticeTarget } from '../plan-access.js';
const grc = { index: 7, context: 'grc' };

test('each free starter course suggests its local exercise instead of a locked specialty lab', () => {
  for (const [id, unit] of [[1,'scope'],[2,'network'],[4,'crypto'],[9,'linux']]) {
    assert.deepEqual(coursePracticeTarget(`desktop-${id}`, grc, {plan:'free'}, false), {kind:'starter', href:`free-studio.html?unit=${unit}`});
  }
});
test('specialty suggestions require both membership and Foundations', () => {
  assert.equal(coursePracticeTarget('desktop-3', grc, {plan:'free'}, true).kind, 'locked');
  assert.equal(coursePracticeTarget('desktop-3', grc, {plan:'pro'}, false).kind, 'locked');
  assert.deepEqual(coursePracticeTarget('desktop-3', grc, {plan:'pro'}, true), {kind:'specialty', href:'practice-lab.html?id=7&context=grc'});
  assert.equal(coursePracticeTarget('desktop-3', grc, {admin:true}, false).kind, 'specialty');
});
test('absent or invalid suggestions cannot produce malformed destination URLs', () => {
  assert.equal(coursePracticeTarget('desktop-3', null, {admin:true}, true), null);
  for (const index of [undefined, NaN, -1, '7']) assert.equal(coursePracticeTarget('desktop-3', {index,context:'grc'}, {admin:true}, true).kind, 'locked');
  assert.equal(coursePracticeTarget('desktop-3', {index:7,context:'a&b'}, {plan:'pro'}, true).href, 'practice-lab.html?id=7&context=a%26b');
});
