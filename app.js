// ============================================================================
// app.js  —  THE WEB SERVER FOR THE COUNTRY-TALLY SERVICE (Node.js + Express)
// ============================================================================
//
// tally.js knows HOW to count transactions by country, but it can't talk to
// the internet on its own. This file wraps that logic in a tiny web server so
// the web page can ask it questions over HTTP.
//
// It offers two web addresses ("endpoints"):
//     GET /tally?items=...   -> count the transactions by country, return JSON
//     GET /health            -> say "ok" so we can tell the service is alive
//
// Like the screening service, this is STATELESS: it saves nothing to disk.
// ============================================================================

const express = require("express"); // a simple web framework for Node

const { tallyByCountry } = require("./tally"); // our counting logic

const app = express();

// The network port this service listens on. Default 8071.
// (The screening service uses 8070; this one uses 8071 so they don't clash.)
const PORT = parseInt(process.env.PORT || "8071", 10);

// The web page runs on a different address from this service, so browsers block
// the request by default for security. This header tells the browser it's fine
// to let them talk to us. (CORS = Cross-Origin Resource Sharing.)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next(); // carry on to the actual handler below
});

// Runs for BOTH the root "/" and "/tally". Listing two paths on one handler
// means these two addresses behave identically:
//     http://localhost:8071/?items=...       (the root)
//     http://localhost:8071/tally?items=...  (the named endpoint)
app.get(["/", "/tally"], (req, res) => {
  // Read the "items" text from the web address (or "" if it is missing).
  const items = req.query.items || "";

  // Count by country and send the result back as JSON.
  res.json(tallyByCountry(items));
});

// A simple "are you alive?" endpoint. Handy for testing and for Docker.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start listening. "0.0.0.0" means "accept connections from anywhere", which is
// needed so the service is reachable from outside its Docker container.
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`country-tally listening on :${PORT}`);
});

// Export the app and server so the automated test can start and stop them.
module.exports = { app, server };
