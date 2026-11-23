# Contract Intake Agent 📑

**Email a contract in, and within a few minutes an AI agent has read it, checked it against a South African legal playbook, proved its findings by quoting the contract word for word, and emailed you a risk summary with Approve / Disapprove buttons. When you click, it files the contract in Google Drive, logs it in a contract register, or drafts the reply asking for changes.**

Activepieces (no-code agent platform) · AI structured extraction · TypeScript verification step · Gmail human-in-the-loop approval · Google Drive · Google Sheets

---

## Why
Legal and procurement teams are a bottleneck: every NDA, SaaS subscription and supplier agreement waits in someone's inbox for a first read. Most are routine, and a few hide clauses that really matter, such as foreign governing law, uncapped liability, or no POPIA terms for personal data. This agent does the first pass in minutes, puts the risky ones in front of a person, and never signs, files or replies on its own.

## How it works
```
Email with PDF to  you+contracts@  ──►  Gmail trigger (new attachment)
        │
        ▼
Extract text (PDF) ──► AI review: 12-rule SA playbook, filled into a fixed JSON schema
        │                 └─ no answer? ──► automatic retry on a stronger model tier
        ▼
Verify (TypeScript): every AI quote must appear in the contract · high-stakes rules re-checked
with plain text matching · risk score and rating · review email + draft reply built
        │
        ▼
Gmail: review email to the reviewer with Approve / Disapprove ── flow PAUSES until a person clicks
        │
   ┌────┴─────────────────────────┐
Approved                      Disapproved
File PDF in Drive              Draft reply to sender listing the requested changes (left in Drafts)
Log row in Contract Register   Log row in Contract Register
```

## Live test results (fictional sample contracts)
| Contract | Rating | Issues | AI quotes verified | What it caught |
|---|---|---|---|---|
| Mutual NDA (Karoo Analytics) | **LOW**, approve | 0 | 5/5 | South African law, POPIA clause, mutual confidentiality for 3 years: meets the playbook |
| SaaS subscription (Umoya Cloud) | **MEDIUM**, approve with changes | 3 | 11/11 | 90-day auto-renewal notice, no termination for convenience, up to 10% annual price increases |
| Logistics MSA (Blue Crane) | **HIGH**, escalate to legal | 12 | 10/10 | English law, client liability unlimited, one-sided indemnity, supplier takes ownership of client data, no POPIA terms despite ID numbers, 36-month auto-renewal with 180 days' notice… |

## The playbook (buy-side, South Africa)
Twelve rules in [`playbook/playbook.md`](playbook/playbook.md), including governing law (SA law, SA courts or AFSA), liability caps, indemnities, auto-renewal, termination for convenience, payment terms (≤ prime + 2%), **POPIA** (s19 safeguards, s22 breach notification, operator terms), **cross-border transfer (s72)**, confidentiality, IP and data ownership, exclusivity, and price escalation. Scoring: HIGH 25 · MEDIUM 10 · LOW 3. A total of 40 or more means escalate to legal; 15 to 39 means approve with changes.

## Guardrails
- **The AI must prove its claims.** Each finding carries a quote, and code checks that the quote appears verbatim in the contract. Quotes that don't are marked *⚠ not found in contract* in the review email.
- **Second opinion on the rules that matter most.** Governing law, POPIA, unlimited liability and auto-renewal are re-checked with plain text matching. If the AI passes a clause that the rule check flags, the email says so.
- **Graceful degradation.** If the first AI call fails, the flow retries on a stronger model. If that fails too, the email still goes out with rule-based checks and says the AI was unavailable.
- **A person decides.** Nothing is filed, logged or drafted until someone clicks. Replies to the counterparty are left as drafts, never sent.
- **Sample data only.** The repo's contracts are fictional. The playbook is a demonstration, not legal advice.

## Engineering notes (lessons from building it)
- **Free-text AI was unreliable here.** On this platform, the free-text AI step sometimes returned only the first line of its answer, or stopped mid-JSON. Switching to the platform's *structured extraction* action with a strict JSON schema fixed it.
- **Models fail in odd ways.** The default tier occasionally "answered in text instead of calling the tool". A router now detects the empty result and retries on the Heavy tier. In testing this rescued the NDA review automatically.
- **Verification lives in code.** [`activepieces/review.ts`](activepieces/review.ts) is unit-tested offline ([`tests/test_review.mts`](tests/test_review.mts)) against planted mistakes: a made-up quote, a wrongly passed clause, garbage AI output, and a clean contract that must raise no false alarms.

## Files
| Path | What |
|---|---|
| `activepieces/flow-export.json` | The flow's structure: 11 steps, 2 routers (IDs replaced with placeholders) |
| `activepieces/ai-extract-prompt.txt` | Reviewer instructions and the playbook given to the AI |
| `activepieces/ai-output-schema.json` | JSON schema the AI must fill |
| `activepieces/review.ts` | Verification, rule checks, scoring, review email and draft reply |
| `playbook/playbook.md` | The 12-rule playbook |
| `samples/*.pdf` | Three fictional contracts: low, medium and high risk |
| `scripts/make_samples.py` | Generates the sample PDFs |
| `tests/test_review.mts` | Offline tests for the verifier (`node --experimental-strip-types tests/test_review.mts`) |

## Run it yourself
1. Create a free Activepieces Cloud account and connect Gmail, Google Drive and Google Sheets.
2. Create a Drive folder and a Google Sheet. The header row is listed in [`flow-export.json`](activepieces/flow-export.json) (step 8 values).
3. Rebuild the flow from `flow-export.json`, pasting in the prompt, schema and `review.ts`.
4. Email a sample PDF from `samples/` to `you+contracts@gmail.com`.

Turn the flow off between demos to save AI credits.

---
Built by **Sihlangu Mthembu** · Agentic workflows & automation · MIT licence
