// ============================================================================
// test_tally.js  —  AUTOMATED TESTS FOR THE COUNTRY-TALLY LOGIC
// ============================================================================
//
// These tests check the counting logic in tally.js without needing a running
// server. Run them with:  npm test
//
// They cover four cases:
//   1. a normal batch (counts add up per country),
//   2. empty input (nothing to count),
//   3. a malformed transaction (goes into the "UNKNOWN" bucket, no crash),
//   4. the totals match the number of transactions given.
// ============================================================================

const test = require("node:test");
const assert = require("node:assert");

const { tallyByCountry } = require("./tally");

test("normal batch: counts each country correctly", () => {
  const out = tallyByCountry("5000-1234-UK,50000-9999-UK,200-4321-US,800-0000-CN");

  assert.strictEqual(out.total_checked, 4);
  assert.strictEqual(out.counts.UK, 2);
  assert.strictEqual(out.counts.US, 1);
  assert.strictEqual(out.counts.CN, 1);
});

test("empty input: nothing to count", () => {
  const out = tallyByCountry("");

  assert.strictEqual(out.total_checked, 0);
  assert.deepStrictEqual(out.counts, {}); // an empty object, no countries
});

test("malformed transaction: goes into the UNKNOWN bucket, does not crash", () => {
  // "bad" has no dashes; "9999-0000-" has an empty country. Both are UNKNOWN.
  const out = tallyByCountry("5000-1234-UK,bad,9999-0000-");

  assert.strictEqual(out.total_checked, 3);
  assert.strictEqual(out.counts.UK, 1);
  assert.strictEqual(out.counts.UNKNOWN, 2);
});

test("totals add up to the number of transactions", () => {
  const out = tallyByCountry("10-1-UK,20-2-UK,30-3-US");

  // The sum of all the per-country counts should equal total_checked.
  const sum = Object.values(out.counts).reduce((a, b) => a + b, 0);
  assert.strictEqual(sum, out.total_checked);
  assert.strictEqual(sum, 3);
});
