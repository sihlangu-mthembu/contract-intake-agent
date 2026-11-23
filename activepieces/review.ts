// Activepieces Code step: "Verify and score".
// Inputs: text = extracted contract text, ai = AI review (JSON string), subject/from/filename = email metadata.
// The AI's work is checked, not trusted: every quote must appear in the contract, and the
// highest-stakes rules are re-checked with plain text matching. Then a risk score is computed.
export const code = async (inputs: any) => {
  const unwrap = (v: any): any => {
    if (typeof v === 'string') { try { v = JSON.parse(v); } catch { return v; } }
    if (v && typeof v === 'object' && 'output' in v && Object.keys(v).length <= 3) return unwrap(v.output);
    return v;
  };
  let text: string = unwrap(inputs.text);
  if (typeof text !== 'string') text = JSON.stringify(text ?? '');
  const raw = unwrap(inputs.ai);
  let ai: any = raw;
  if (typeof raw === 'string') {
    const m = raw.match(/\{[\s\S]*\}/);
    try { ai = JSON.parse(m ? m[0] : raw); } catch { ai = null; }
  }
  const aiOk = !!(ai && Array.isArray(ai.checks));
  if (!aiOk) ai = { checks: [], summary: 'The AI review could not be read, so only the rule checks below were applied.' };

  const norm = (s: string) => (s || '').toLowerCase().replace(/[‘’`]/g, "'").replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
  const T = norm(text);

  const NAMES: Record<string, string> = {
    R1: 'Governing law', R2: 'Limitation of liability', R3: 'Indemnities', R4: 'Auto-renewal',
    R5: 'Termination for convenience', R6: 'Payment terms', R7: 'Data protection (POPIA)', R8: 'Cross-border transfer',
    R9: 'Confidentiality', R10: 'IP and our data', R11: 'Exclusivity', R12: 'Price escalation',
  };
  const W: Record<string, number> = { HIGH: 25, MEDIUM: 10, LOW: 3 };

  // 1) quote verification
  const checks = (ai.checks || []).filter((c: any) => c && NAMES[c.rule]).map((c: any) => {
    const q = norm(c.quote || '');
    const verified = !q || T.includes(q) || T.includes(q.replace(/^"|"$/g, ''));
    return { ...c, status: String(c.status || '').toUpperCase(), severity: String(c.severity || '').toUpperCase(),
             quote_verified: verified, source: 'AI' };
  });
  const byRule: Record<string, any> = {};
  for (const c of checks) byRule[c.rule] = c;
  const notes: string[] = [];

  // 2) independent rule checks on the raw text
  const flag = (rule: string, severity: string, finding: string, ask: string, quote = '') => {
    const c = byRule[rule];
    if (c && (c.status === 'ISSUE' || c.status === 'MISSING')) return; // AI already caught it
    if (c) notes.push(`${rule}: the AI marked this ${c.status || 'unclear'}, but the rule check found a problem.`);
    const fresh = { rule, status: quote ? 'ISSUE' : 'MISSING', severity, finding, quote, ask, quote_verified: true, source: 'Rule check' };
    if (c) Object.assign(c, fresh); else { checks.push(fresh); byRule[rule] = fresh; }
  };
  const sentence = (re: RegExp) => { const m = text.replace(/\s+/g, ' ').match(new RegExp(`[^.]*${re.source}[^.]*\\.`, 'i')); return m ? m[0].trim().replace(/^\d+(\.\d+)*\s+/, '').slice(0, 300) : ''; };

  if (!/laws of the republic of south africa|south african law/.test(T)) {
    const q = sentence(/governed by the laws/);
    flag('R1', 'HIGH', 'Not governed by South African law.', 'Please amend the governing law to the laws of the Republic of South Africa, with disputes referred to AFSA arbitration or the South African courts.', q);
  }
  const personal = /personal information|identity numbers?|id numbers?|contact details|names?, identity/.test(T);
  if (personal && !/popia|protection of personal information/.test(T)) {
    flag('R7', 'HIGH', 'Personal information is processed but there is no POPIA clause.', 'Please add an operator clause under POPIA (sections 19-22): processing only on our instructions, security safeguards and breach notification within 72 hours.');
  }
  if (/client's liability[^.]{0,40}unlimited|liability of the client[^.]{0,40}unlimited/.test(T)) {
    flag('R2', 'HIGH', 'Our liability is unlimited while the supplier\'s is capped.', 'Please make the limitation of liability mutual, capped at the fees paid in the preceding 12 months.', sentence(/unlimited/));
  }
  const renew = T.match(/renews? automatically[^.]*?(\d+)\s*months[^.]*?(\d+)\s*days/);
  if (renew) {
    const months = +renew[1], days = +renew[2];
    const bad = (months > 12 ? 1 : 0) + (days > 60 ? 1 : 0);
    if (bad) flag('R4', bad === 2 ? 'HIGH' : 'MEDIUM', `Auto-renews for ${months} months with ${days} days' notice.`, 'Please limit renewals to 12-month periods with a 60-day notice window, and send a reminder 30 days before the notice deadline.', sentence(/renews? automatically/));
  }

  // 3) score
  const issues = checks.filter((c: any) => c.status === 'ISSUE' || c.status === 'MISSING');
  for (const c of issues) if (!W[c.severity]) c.severity = 'MEDIUM';
  const unverified = checks.filter((c: any) => !c.quote_verified);
  const score = issues.reduce((s: number, c: any) => s + W[c.severity], 0);
  const rating = score >= 40 ? 'HIGH' : score >= 15 ? 'MEDIUM' : 'LOW';
  const recommendation = rating === 'HIGH' ? 'Escalate to legal before signing'
    : rating === 'MEDIUM' ? 'Approve with changes' : 'Approve';
  const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  issues.sort((a: any, b: any) => order[a.severity] - order[b.severity]);

  // 4) email HTML
  const e = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const col: Record<string, string> = { HIGH: '#b91c1c', MEDIUM: '#b45309', LOW: '#15803d' };
  const bg: Record<string, string> = { HIGH: '#fee2e2', MEDIUM: '#fef3c7', LOW: '#dcfce7' };
  const badge = (s: string) => `<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:700;color:${col[s]};background:${bg[s]}">${s}</span>`;
  const kv = [['Counterparty', ai.counterparty], ['Type', ai.contract_type], ['Effective date', ai.effective_date], ['Term', ai.term],
    ['Renewal', ai.renewal], ['Termination', ai.termination], ['Fees / value', ai.fees_or_value], ['Payment', ai.payment_terms],
    ['Governing law', ai.governing_law], ['Personal information', ai.personal_information_processed === true ? 'Yes' : ai.personal_information_processed === false ? 'No' : '']]
    .filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:4px 10px 4px 0;color:#6b7280;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:4px 0">${e(v)}</td></tr>`).join('');
  const rows = issues.map((c: any) => `<tr style="border-top:1px solid #e5e7eb">
    <td style="padding:8px 8px 8px 0;vertical-align:top">${badge(c.severity)}</td>
    <td style="padding:8px;vertical-align:top"><b>${c.rule} ${NAMES[c.rule]}</b><br>${e(c.finding)}
      ${c.quote ? `<div style="margin-top:4px;padding:4px 8px;border-left:3px solid #d1d5db;color:#4b5563;font-style:italic">"${e(c.quote)}" ${c.quote_verified ? '<span style="color:#15803d;font-style:normal">✓ found in contract</span>' : '<span style="color:#b91c1c;font-style:normal">⚠ not found in contract</span>'}</div>` : ''}
      ${c.ask ? `<div style="margin-top:4px"><b>Ask:</b> ${e(c.ask)}</div>` : ''}
      ${c.source === 'Rule check' ? '<div style="font-size:11px;color:#6b7280">Caught by the rule check</div>' : ''}</td></tr>`).join('');
  const okList = checks.filter((c: any) => c.status === 'OK').map((c: any) => `${c.rule} ${NAMES[c.rule]}`).join(' · ');
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:720px;color:#111827;font-size:14px;line-height:1.45">
  <div style="font-size:12px;color:#6b7280">Contract Intake Agent · ${e(inputs.filename || '')}</div>
  <h2 style="margin:6px 0 4px">${e(ai.title || ai.contract_type || 'Contract')} · ${e(ai.counterparty || '')}</h2>
  <div style="margin:6px 0 12px">Risk ${badge(rating)} <b style="margin-left:6px">${score}</b> points · <b>${recommendation}</b> · ${issues.length} issue(s)</div>
  <p style="margin:0 0 12px">${e(ai.summary || '')}</p>
  <table style="border-collapse:collapse;font-size:13px;margin-bottom:14px">${kv}</table>
  ${issues.length ? `<h3 style="margin:14px 0 4px;font-size:15px">Issues against the playbook</h3><table style="border-collapse:collapse;width:100%;font-size:13px">${rows}</table>` : '<p><b>No issues found against the playbook.</b></p>'}
  ${okList ? `<p style="font-size:12px;color:#6b7280;margin-top:12px">Meets the playbook: ${okList}</p>` : ''}
  ${notes.length || unverified.length || !aiOk ? `<p style="font-size:12px;color:#b91c1c">Checks: ${[!aiOk ? 'AI review unreadable' : '', ...notes, unverified.length ? `${unverified.length} AI quote(s) could not be found in the contract, so treat those findings with care` : ''].filter(Boolean).map(e).join(' ')}</p>` : '<p style="font-size:12px;color:#15803d">All AI quotes were verified against the contract text.</p>'}
  <p style="margin-top:16px"><b>Approve</b> files the contract in Google Drive and logs it in the register. <b>Disapprove</b> logs it and drafts a reply to the sender with the requested changes, for you to review before sending.</p>
  <p style="font-size:11px;color:#9ca3af">Automated first-pass review against a demonstration playbook. Not legal advice.</p></div>`;

  // 5) draft reply to the counterparty (only used if disapproved)
  const asks = issues.filter((c: any) => c.ask).map((c: any, i: number) => `<li><b>${NAMES[c.rule]}</b> (clause: "${e((c.quote || 'missing').slice(0, 120))}"): ${e(c.ask)}</li>`).join('');
  const draft = `<p>Hi,</p><p>Thank you for sending through the ${e(ai.contract_type || 'agreement')}. We have reviewed it and would like to propose the following changes before signing:</p><ol>${asks}</ol><p>Happy to discuss on a call if helpful.</p><p>Kind regards,<br>Mthembu Advisory</p>`;

  const today = new Date().toISOString().slice(0, 10);
  const safe = (s: string) => String(s || 'Unknown').replace(/[\\/:*?"<>|]/g, '').slice(0, 60);
  return {
    rating, score, recommendation, issue_count: issues.length,
    high: issues.filter((c: any) => c.severity === 'HIGH').length,
    counterparty: ai.counterparty || 'Unknown', contract_type: ai.contract_type || '', title: ai.title || '',
    effective_date: ai.effective_date || '', term: ai.term || '', renewal: ai.renewal || '', governing_law: ai.governing_law || '',
    summary: ai.summary || '', top_issues: issues.slice(0, 3).map((c: any) => `${c.severity}: ${NAMES[c.rule]}`).join('; '),
    quotes_verified: `${checks.filter((c: any) => c.quote && c.quote_verified).length}/${checks.filter((c: any) => c.quote).length}`,
    ai_ok: aiOk, notes,
    subject: `[Contract review] ${safe(ai.counterparty)}: ${rating} risk, ${recommendation}`,
    html, draft_html: draft,
    drive_name: `${today} ${safe(ai.counterparty)} - ${safe(ai.contract_type)}.pdf`,
    received: today,
  };
};
