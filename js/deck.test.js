import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shuffle, Deck } from './deck.js';

test('shuffle returns the same elements as a different permutation is possible', () => {
  const input = [1, 2, 3, 4];
  const result = shuffle(input, () => 0);
  assert.deepEqual([...result].sort(), [1, 2, 3, 4]);
  assert.notEqual(result, input); // returns a new array, does not mutate
  assert.deepEqual(input, [1, 2, 3, 4]); // original untouched
});

test('shuffle with rng always returning 0 is deterministic', () => {
  // Fisher-Yates, rng() === 0 always picks index 0 to swap with:
  // i=3: swap(3,0) -> [4,2,3,1]
  // i=2: swap(2,0) -> [3,2,4,1]
  // i=1: swap(1,0) -> [2,3,4,1]
  assert.deepEqual(shuffle([1, 2, 3, 4], () => 0), [2, 3, 4, 1]);
});

test('Deck.next() always returns triples', () => {
  const deck = new Deck([1, 2, 3, 4, 5, 6], () => 0.5);
  assert.equal(deck.next().length, 3);
  assert.equal(deck.next().length, 3);
});

test('Deck covers the whole pool exactly once when size is a multiple of 3', () => {
  const pool = ['a', 'b', 'c', 'd', 'e', 'f'];
  const deck = new Deck(pool, Math.random);
  const seen = [...deck.next(), ...deck.next()];
  assert.deepEqual([...seen].sort(), [...pool].sort());
});

test('Deck reshuffles the full pool once fewer than 3 items remain', () => {
  const deck = new Deck([1, 2, 3, 4], () => 0);
  deck.next(); // cursor -> 3, 1 remains
  assert.equal(deck.order.length, 4);
  deck.next(); // remaining (1) < 3, must reshuffle before drawing
  assert.equal(deck.cursor, 3);
  assert.equal(deck.order.length, 4);
});

test('Deck throws when the pool has fewer than 3 items', () => {
  assert.throws(() => new Deck([1, 2], Math.random), /at least 3/);
});
