# ClaimFlow - Expense Claims Build Task

A working expense-claims prototype for staff, managers, and finance. It focuses on reducing the effort of filing small expenses while keeping approval, duplicate detection, monthly limits, and payment controls visible.

**Live app:** https://manoharkonagandla.github.io/expense-claims/

## What is implemented

- Staff can create claims, see their unpaid/open claims, and review parsed details before submission.
- Managers can file claims too, review the claims of their direct reports, and cannot approve their own claims.
- Finance can review approved claims, mark them as paid, and view monthly spend by category and person.
- Paid claims are terminal: once paid, the UI does not provide a path back to approval.
- Duplicate receipts are checked using normalized receipt text, overlap scoring, matching amounts, and receipt dates. Likely duplicates are flagged for review instead of being silently accepted.
- Receipt text can be pasted in a messy format and parsed locally into merchant, amount, category, and date. The extracted result is shown before submission and can be corrected.
- A **receipt photo can be attached optionally** as supporting evidence. The claim can still be submitted without a photo.
- Monthly limits are seeded with realistic people and spend, including users who are close to or over their limit.
- Demo data includes realistic vendors, taxi/meal/travel/supply claims, duplicate submissions, a rejected claim, and manager/finance workflows.
- Data is stored in browser `localStorage` so the demo works without a database or paid service.

## Demo users

Use the **Viewing as** selector to test each persona. The selector is grouped into Staff, Managers, and Finance so the names remain easy to read and the workflow can be switched quickly.

- Ananya Rao - Staff
- Rahul Mehta - Staff
- Meera Iyer - Staff
- Arjun Nair - Staff
- Vikram Shah - Manager
- Neha Kapoor - Manager
- Priya Menon - Finance

## How to use

### Live

Open the deployed URL above. No installation is required.

### Run locally

The project is a plain HTML/CSS/JavaScript site with no build step or dependency installation. From the project folder you can either open `index.html` directly or run a small static server:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173/`.

### Suggested walkthrough

1. Start as **Ananya Rao - Staff** and open **New claim**.
2. Paste one of the receipt examples, click **Parse & check duplicates**, and review/correct the extracted merchant, amount, category, date, and description.
3. Optionally attach a receipt photo. It is supporting evidence, not a required field.
4. Submit the claim and open **Claims** to see the workflow status.
5. Switch to **Vikram Shah - Manager** and open **Team approvals**. A manager can approve team claims but the app blocks self-approval.
6. Switch to **Priya Menon - Finance** to review approved claims, mark them paid, and inspect **Month spend** for category totals and monthly limits.
7. Use the duplicate example to see how a likely duplicate receipt is flagged.

## Decisions and assumptions

### Approval rules

- A staff claim is approved by the claimant's direct manager.
- A manager can file claims like any other employee, but cannot approve their own claim. Their claim follows their manager relationship.
- Finance can also file a claim. Finance cannot pay their own claim; payment is kept separate from the claimant action in the demo.
- Managers can reject claims. Paid claims cannot be rejected or moved backwards.
- Paid is terminal: payment is the final workflow state available in the prototype.

### Duplicate protection

- The app normalizes receipt text to reduce differences caused by case, punctuation, dates, times, currency words, and extra words.
- It calculates text overlap, checks the parsed amount, and considers receipt timing when judging similarity.
- A likely duplicate is surfaced visibly as `Flagged duplicate` for Finance review instead of pretending the heuristic is perfect.
- Rejected claims are ignored when checking duplicates because a corrected/resubmitted claim may legitimately use different information.
- The current implementation is intentionally heuristic; a production system should use stronger receipt identity signals and server-side controls.

### Monthly limits

- Each demo person has a monthly spending limit. Finance sees usage by person and category for September 2026.
- Rejected claims do not count toward spend. Submitted, approved, paid, and duplicate-flagged claims are included in spend.
- Going over a limit does not block filing in this prototype; it produces a visible warning so the reviewer can decide how company policy should behave.

### Receipt input and optional photo

- The fast path is pasted receipt text because a small expense should not require a long form.
- Parsed fields are shown before submission so the claimant can correct mistakes.
- Receipt photos are optional. They are resized in the browser before being stored in `localStorage` to keep the demo lightweight.
- A production version would move receipt files to object storage and keep only a secure reference in the claim record.

### Storage, roles, and deployment

- This is a single demo workspace rather than a production authentication system. The role/person selector exists to make all three personas easy to test.
- `localStorage` is used for persistence because the brief does not provide a database, identity provider, or payment provider and the goal is a zero-setup prototype.
- Payment is emulated with **Mark paid** rather than connected to a real gateway, which is explicitly allowed by the brief.

## AI tools used

- **ChatGPT** was used as a development aid to help interpret the brief, explore UI and workflow approaches, improve the accuracy and effectiveness of the receipt/duplicate logic, review edge cases, and refine the README and implementation during iteration.
- I reviewed and integrated the resulting suggestions into the project, made the final product decisions, and tested the application flows. The app itself does not depend on an external LLM or paid AI service at runtime. Receipt parsing and duplicate checking currently run locally in the browser.

## What I would do with another week

- Add real authentication, role-based authorization, and server-side enforcement for approval/payment rules.
- Move claims, audit history, receipt files, and monthly limits to a database/object-storage backend.
- Add receipt image OCR and use an LLM selectively for low-confidence extraction rather than for every claim.
- Strengthen duplicate detection with image hashing, receipt identifiers, vendor/date/amount matching, and better semantic comparison.
- Add configurable expense policies, escalation paths, audit logs, exports, notifications, and automated tests.
- Add a production payment integration only after the approval and audit controls are server-side.

## Requirement mapping

| Brief requirement | Implementation |
|---|---|
| Staff files claims | New claim flow + Claims view |
| Staff watches unpaid | Dashboard + open claim statuses |
| Managers file claims | New claim available to manager users |
| Manager reviews team | Team approvals view |
| Manager cannot approve own claim | UI blocking + handler check |
| Paid claim is finished | Paid is terminal in available actions |
| Duplicate receipt protection | Normalization + similarity + amount/date checks + visible flag |
| Monthly spend | Finance Month spend dashboard |
| Over-limit visibility | People & limits panel + alerts |
| Paste receipt text | Local receipt parser |
| Review/correct before manager | Editable parsed fields before submit |
| Receipt photo | Optional image upload + preview + persisted evidence |
| Realistic data | Named people, vendors, dates, duplicate examples, limits |
| AI usage explained | AI tools section above |
| Payment can be emulated | Finance Mark paid action |

