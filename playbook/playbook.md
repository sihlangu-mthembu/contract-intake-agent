# Contract review playbook (South Africa, buy-side)

Written from the point of view of **Mthembu Advisory (Pty) Ltd**, a South African consulting firm receiving contracts from suppliers and partners. The AI checks every incoming contract against these rules; code then verifies its quotes and cross-checks the most important rules with plain text matching.

| ID | Rule | What good looks like | Severity if not met |
|---|---|---|---|
| R1 | Governing law & jurisdiction | Laws of the Republic of South Africa; SA courts or AFSA arbitration | HIGH |
| R2 | Limitation of liability | Mutual cap, at least 12 months' fees; no uncapped liability for us | HIGH (uncapped for us) · MEDIUM (no cap at all) |
| R3 | Indemnities | Mutual, or limited to third-party IP / wilful misconduct | HIGH (one-sided against us) |
| R4 | Auto-renewal | Renewal term ≤ 12 months and notice to cancel ≤ 60 days | MEDIUM (one breached) · HIGH (both) |
| R5 | Termination for convenience | We can terminate on ≤ 90 days' notice; supplier cannot walk away on short notice | MEDIUM |
| R6 | Payment terms | ≥ 30 days from invoice; late interest ≤ prime + 2% a year | MEDIUM |
| R7 | Data protection (POPIA) | If personal information is processed: POPIA compliance, security safeguards (s19), breach notification (s22), operator terms (s20–21) | HIGH (missing) |
| R8 | Cross-border transfer | Transfers outside SA only with POPIA s72 safeguards | MEDIUM |
| R9 | Confidentiality | Mutual, survives ≥ 2 years after termination | MEDIUM |
| R10 | Intellectual property & our data | We keep ownership of our data and of deliverables we pay for | HIGH |
| R11 | Exclusivity / non-compete | None, or narrow and time-limited | MEDIUM |
| R12 | Price escalation | Capped at CPI or ≤ 8% a year, with notice | MEDIUM |

**Risk score:** HIGH = 25, MEDIUM = 10, LOW = 3 per issue.
**Rating:** ≥ 40 → *High risk: escalate to legal* · 15–39 → *Medium: approve with changes* · < 15 → *Low: approve*.

This is a demonstration playbook, not legal advice. A real deployment would use the firm's own legal positions.
