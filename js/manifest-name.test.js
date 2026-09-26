import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nameFromFilename } from './manifest-name.js';

test('replaces underscores with spaces and strips extension', () => {
  assert.equal(nameFromFilename('Ivan_Petrov.jpg'), 'Ivan Petrov');
});

test('replaces dashes with spaces, keeps original casing', () => {
  assert.equal(nameFromFilename('john-doe.png'), 'john doe');
});

test('collapses repeated separators and mixed-case extensions', () => {
  assert.equal(nameFromFilename('weird__name--test.WEBP'), 'weird name test');
});

test('leaves a filename with no extension untouched', () => {
  assert.equal(nameFromFilename('noext'), 'noext');
});

test('only strips the last extension', () => {
  assert.equal(nameFromFilename('a.b.c.jpg'), 'a.b.c');
});

test('trims leading and trailing separators', () => {
  assert.equal(nameFromFilename('-leading-dash.png'), 'leading dash');
});
