import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateTotalCents } from '../src/utils/pricing.js';

describe('calculateTotalCents', () => {
  it('adds the standard shipping charge below the free-shipping threshold', () => {
    assert.equal(calculateTotalCents(9999), 10799);
  });

  it('removes shipping at the threshold and above', () => {
    assert.equal(calculateTotalCents(10000), 10000);
    assert.equal(calculateTotalCents(12550), 12550);
  });
});
