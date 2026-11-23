import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const { code } = await import("../activepieces/review.ts");
const text = readFileSync("/tmp/c3.txt", "utf8");
const ai = JSON.stringify({ contract_type: "Master Services Agreement", counterparty: "Blue Crane Logistics Ltd", title: "MASTER SERVICES AGREEMENT",
  governing_law: "England and Wales", personal_information_processed: true, summary: "Courier and storage MSA heavily weighted to the supplier.",
  checks: [
    { rule: "R1", status: "OK", severity: "", finding: "Fine", quote: "" },                                   // wrong: should be ISSUE
    { rule: "R2", status: "ISSUE", severity: "HIGH", finding: "Client liability unlimited", quote: "The Client's liability to the Supplier is unlimited." },
    { rule: "R10", status: "ISSUE", severity: "HIGH", finding: "Supplier owns scans", quote: "shall vest in and become the property of the Supplier" },
    { rule: "R6", status: "ISSUE", severity: "MEDIUM", finding: "15 days, 2% a month", quote: "Invoices are payable within 7 days." }, // made-up quote
  ] });
const r = await code({ text: { output: text }, ai: { output: ai }, filename: "03.pdf" });
assert.equal(r.rating, "HIGH");
assert.ok(r.notes.some((n) => n.startsWith("R1:")), "R1 disagreement noted");
assert.ok(r.top_issues.includes("HIGH"));
assert.match(r.html, /not found in contract/);            // fabricated quote caught
assert.match(r.html, /Caught by the rule check/);          // POPIA/R1 caught by rules
assert.match(r.html, /Data protection \(POPIA\)/);
assert.match(r.html, /Auto-renewal/);                       // 36 months / 180 days rule
assert.equal(r.quotes_verified.split("/")[0] !== r.quotes_verified.split("/")[1], true);
console.log(r.subject, "|", r.score, "|", r.top_issues, "|", r.quotes_verified, "|", r.notes);
writeFileSync("/tmp/review.html", r.html);
// garbage AI output still produces a rule-based review
const g = await code({ text, ai: "sorry I can't", filename: "x.pdf" });
assert.equal(g.ai_ok, false); assert.ok(g.issue_count >= 3); console.log("garbage AI ->", g.rating, g.issue_count);
// clean NDA via rules only should not raise false alarms
const nda = readFileSync("/tmp/c1.txt", "utf8");
const n = await code({ text: nda, ai: JSON.stringify({ counterparty: "Karoo Analytics", checks: [] }), filename: "01.pdf" });
assert.equal(n.issue_count, 0); console.log("NDA rules-only ->", n.rating, n.issue_count);
// AI failed first time, retry succeeded
const rr = await code({ text, ai: null, ai_retry: { output: JSON.parse(ai) }, filename: "03.pdf" });
assert.equal(rr.ai_ok, true); assert.equal(rr.ai_source, "AI (retried on Heavy tier)"); console.log("retry path ->", rr.ai_source);
console.log("all review tests passed");
