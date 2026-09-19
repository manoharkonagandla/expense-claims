# ClaimFlow - Expense Claims Build Task

A working expense-claims prototype built from the **Build Task: Expense Claims** brief. It is designed to be easy to open, test, and deploy on a free tier.

## What is implemented

- **Staff** can create claims, see their unpaid claims, and review the parsed claim before submission.
- **Managers** can file claims too, review their team, and cannot sign off their own claim.
- **Finance** can see all claims, mark approved claims as paid, and view September spend by category and person.
- **Paid claims are terminal**: there is no UI path that moves a paid claim back into approval.
- **Duplicate receipt protection** normalizes receipt wording, compares text overlap, and checks amount; likely duplicate submissions are visibly flagged rather than silently accepted.
- **Receipt parsing** accepts messy pasted receipt text and extracts merchant, amount, category, and date using local heuristics. The extracted values are shown to the user before submission.
- **Monthly limits** are seeded with realistic people and spend, including users near/over their limit.
- **Realistic seed data** includes a taxi receipt, meals, hotel, office supplies, a manager claim, and the same lounge receipt filed twice in slightly different words.
- **Persistence** uses browser `localStorage`, so the demo works without a backend or paid service.

## Demo roles

Use the role/person selector in the left sidebar to switch between:

- Ananya Rao - Staff
- Rahul Mehta - Staff
- Meera Iyer - Staff
- Arjun Nair - Staff
- Vikram Shah - Manager
- Neha Kapoor - Manager
- Priya Menon - Finance

## How to run

No Node.js, package manager, database, or API key is required. Open `index.html` in a browser, or serve the folder with any static web server, for example:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173/`.

## Decisions and assumptions

The brief intentionally leaves the implementation choices open. These are the main assumptions made here:

1. **Single demo workspace instead of authentication.** A role/person switcher lets reviewers test each persona quickly. A production version should use real authentication and server-side authorization.
2. **Browser persistence instead of a backend.** The build task asks for a working version but does not provide a database, identity provider, or payment gateway. `localStorage` keeps the prototype usable without setup.
3. **Manager hierarchy is represented in seed data.** Each staff member has a manager ID. A manager sees their own claims plus the claims of direct reports. Finance sees all claims.
4. **Duplicate detection is intentionally non-blocking.** A receipt can still be submitted, but a likely duplicate becomes `Flagged duplicate` so Finance can review it. This is safer for a prototype than pretending the heuristic is perfect.
5. **Receipt parsing is deterministic and local.** No paid API key is required. The app parses common receipt patterns for amount/date/merchant/category and always shows the result before submission.
6. **Limits are monthly and use September 2026 demo data.** Rejected claims do not count toward spend. Paid, approved, pending, and duplicate-flagged claims do.
7. **Payment is emulated.** Finance uses a “Mark paid” action because the brief explicitly says payment integration is not required and may be emulated.

## AI tools used

- **ChatGPT** was used to help interpret the requirements, design the user flows, generate the implementation, seed realistic data, and review the rules coverage.
- The application itself does **not** require an external LLM or paid AI provider at runtime. Receipt parsing and duplicate checks are implemented locally so the demo remains self-contained.

## What I would do with another week

- Add real authentication, RBAC, and server-side authorization.
- Move claims and audit history to a database with immutable status transitions.
- Add receipt photo upload and OCR, then use an LLM only for low-confidence field extraction.
- Improve duplicate detection with receipt image hashing and stronger semantic matching.
- Add policy rules (per-category caps, date windows, required receipts) and approval escalation.
- Add finance exports, audit logs, notifications, and proper payment-provider integration.
- Add automated unit, integration, and end-to-end tests plus CI.
- Deploy a production version with a hosted database and object storage.

## Suggested free-tier deployment

This project is a plain static site and can be deployed directly to GitHub Pages, Vercel, Netlify, or Cloudflare Pages. Upload the four files in this folder and set the site root to the repository root.

## Requirement mapping

| Brief requirement | Implementation |
|---|---|
| Staff files claims | New claim modal + Claims view |
| Staff watches unpaid | Dashboard “Still unpaid” + claim statuses |
| Managers file claims | New claim is available for Manager users |
| Manager reviews team | Team approvals view |
| Manager cannot approve own claim | Approval button disabled and handler enforces the rule |
| Paid is finished | Paid claims are terminal in the available actions |
| Duplicate receipt protection | Normalization + similarity + amount check + visible flag |
| Month spend by category | Finance “Month spend” dashboard |
| Show who is over limit | People & limits panel + alerts |
| Paste receipt text | Receipt parser modal |
| Correct extracted fields before submit | Editable description plus parsed preview; examples make parsing easy to test |
| Realistic data | Named people, vendors, dates, amounts, duplicate pair, limit pressure |
| Explain assumptions / AI / next week | This README |
| Payment may be emulated | Finance “Mark paid” action |


