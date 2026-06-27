// ============================================================================
// tally.js  —  COUNT TRANSACTIONS BY COUNTRY
// ============================================================================
//
// This is the one job of the country-tally service: take a batch of
// transactions and count how many came from each country.
//
// A transaction is text shaped like:  amount-card-country
// For example:  5000-1234-UK   means  amount=5000, card=1234, country=UK
//
// This service only cares about the LAST part (the country). It does not look
// at the amount at all. It is "stateless": it remembers nothing between calls,
// so the same input always gives the same answer.
// ============================================================================

// Count how many transactions belong to each country.
//
// `items` is the raw text from the request, e.g. "5000-1234-UK,200-4321-US".
// Returns an object like:
//   { counts: { "UK": 2, "US": 1 }, total_checked: 3 }
function tallyByCountry(items) {
  // `counts` will hold the running totals, one entry per country.
  // For example, after processing it might look like { "UK": 2, "US": 1 }.
  const counts = {};

  // Split the batch on commas into single transactions.
  // .filter((t) => t !== "") throws away empty pieces, which can happen if the
  // text has a stray comma (e.g. "5000-1234-UK,," would give empty pieces).
  // If `items` is empty, we use an empty list (there is nothing to count).
  const transactions = items ? items.split(",").filter((t) => t !== "") : [];

  // Look at each transaction one at a time.
  for (const tx of transactions) {
    // Split "5000-1234-UK" into the list ["5000", "1234", "UK"].
    const parts = tx.split("-");

    // The country is the 3rd part. A correct transaction has exactly 3 parts
    // AND a non-empty country. Anything else is counted as "UNKNOWN" so that
    // bad input never crashes the service (it just gets its own bucket).
    const country =
      parts.length === 3 && parts[2] !== "" ? parts[2] : "UNKNOWN";

    // Add one to this country's total. If we haven't seen the country yet,
    // (counts[country] || 0) starts it at 0 before adding 1.
    counts[country] = (counts[country] || 0) + 1;
  }

  // Hand back the per-country totals and how many transactions we looked at.
  return {
    counts: counts,
    total_checked: transactions.length,
  };
}

// Make the function available to app.js (and to the tests).
module.exports = { tallyByCountry };
