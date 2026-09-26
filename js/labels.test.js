import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESETS,
  validateCustomLabels,
  createPinState,
  clickChip,
  clickCard,
} from './labels.js';

test('PRESETS has at least one preset with exactly 3 labels', () => {
  assert.ok(PRESETS.length > 0);
  for (const preset of PRESETS) {
    assert.equal(preset.labels.length, 3);
  }
});

test('validateCustomLabels trims and accepts three non-empty labels', () => {
  assert.deepEqual(validateCustomLabels(' Kiss ', 'Marry', 'Kill'), ['Kiss', 'Marry', 'Kill']);
});

test('validateCustomLabels rejects when any label is empty after trim', () => {
  assert.equal(validateCustomLabels('Kiss', '  ', 'Kill'), null);
});

test('createPinState starts with nothing armed and no pins', () => {
  assert.deepEqual(createPinState(), { armed: null, pins: {} });
});

test('clickChip arms a label, clicking it again disarms it', () => {
  let state = createPinState();
  state = clickChip(state, 'Kiss');
  assert.equal(state.armed, 'Kiss');
  state = clickChip(state, 'Kiss');
  assert.equal(state.armed, null);
});

test('clickCard pins the armed label and clears armed', () => {
  let state = createPinState();
  state = clickChip(state, 'Kiss');
  state = clickCard(state, 0);
  assert.deepEqual(state, { armed: null, pins: { 0: 'Kiss' } });
});

test('clicking an already-pinned card unpins it', () => {
  let state = { armed: null, pins: { 0: 'Kiss' } };
  state = clickCard(state, 0);
  assert.deepEqual(state, { armed: null, pins: {} });
});

test('a label already pinned elsewhere cannot be armed again', () => {
  let state = { armed: null, pins: { 0: 'Kiss' } };
  state = clickChip(state, 'Kiss');
  assert.deepEqual(state, { armed: null, pins: { 0: 'Kiss' } });
});

test('clicking a card with nothing armed and no existing pin is a no-op', () => {
  const state = createPinState();
  assert.deepEqual(clickCard(state, 1), state);
});

test('full flow: pin two labels, unpin one, re-arm its label', () => {
  let state = createPinState();
  state = clickChip(state, 'Kiss');
  state = clickCard(state, 0);
  state = clickChip(state, 'Marry');
  state = clickCard(state, 1);
  assert.deepEqual(state.pins, { 0: 'Kiss', 1: 'Marry' });
  state = clickCard(state, 0); // unpin card 0
  assert.deepEqual(state.pins, { 1: 'Marry' });
  state = clickChip(state, 'Kiss'); // now armable again
  assert.equal(state.armed, 'Kiss');
});
