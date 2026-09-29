import test from 'node:test';
import assert from 'node:assert/strict';
import { fullName as client } from '../full-name.js';
import { fullName as server } from '../functions/academy-progress/src/name.js';

test('client and server require two or three real name parts', () => {
  for (const name of ['Adam Smith', 'محمد أحمد', 'محمد أحمد صالح', 'Mary Jane O’Brien']) {
    assert.equal(client(name), name);
    assert.equal(server(name), name);
  }
  for (const name of ['', 'Biuret', 'A B', 'First Last Fourth Fifth', 'Test 123', '<script> User']) {
    assert.equal(client(name), null);
    assert.equal(server(name), null);
  }
});
