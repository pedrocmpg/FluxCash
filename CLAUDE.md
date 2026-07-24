# FluxCash

Personal finance manager (income, expenses, investments) with automatic transaction
categorization and a KPI/charts dashboard. Learning project (Systems Analysis and Development),
single-user, runs **100% locally** — no cloud, no auth, no external services.

## Where the code lives

The actual app is in **`app/`**, not the repo root. Always `cd app` before running anything.

```
FluxCash/
├── CLAUDE.md          # this file
├── README.md          # user-facing readme (keep in sync with this file's feature list)
└── app/               # the Next.js app — see app/AGENTS.md for a framework-version warning
    ├── app/            # Next.js App Router: dashboard/, transactions/, import/, api/
    ├── components/      # dashboard/, transactions/, import UI lives in app/import/page.tsx
    ├── hooks/           # useTransactions, useTransactionMutations, useSummary, useStatementImport
    ├── lib/
    │   ├── db/client.ts             # SQLite connection + schema migrations (see below)
    │   ├── services/                # business logic, one file per concern (see below)
    │   ├── validation/schemas.ts     # Zod schemas
    │   └── utils/                    # formatters, normalizeText
    ├── types/           # transaction, summary, api
    └── data/fluxcash.db  # the actual SQLite file (gitignored)
```

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- **SQLite via `node:sqlite`** (native Node API, experimental) — no ORM, raw SQL with named params
- Zod for validation, TanStack React Query for server state, React Hook Form, Recharts, Jest + RTL

No environment variables, no external services, no auth. `npm run dev` and it just works.

## Running it

```bash
cd app
npm install
npm run dev      # http://localhost:3000
npm test         # Jest — jsdom for components, node for API routes (@jest-environment node docblock)
npx tsc --noEmit # typecheck
npx eslint .
```

As of 2026-07-24: **99 tests, 1 pre-existing unrelated failure** in
`components/transactions/__tests__/TransactionTable.test.tsx` (a text-matcher mismatch — confirmed
via `git stash` to predate any recent work here, not a regression to chase).

## Database

`lib/db/client.ts` opens `data/fluxcash.db` and runs `CREATE TABLE IF NOT EXISTS` + an `ALTER TABLE`
guard on every call to `getDb()` — there is no migration framework, schema changes are applied
idempotently in this file. Two tables:

- **`transactions`**: `id, value, description, category, type, investment_type, timestamp, external_id`.
  `external_id` has a unique index (`WHERE external_id IS NOT NULL`) used for import deduplication.
- **`merchant_rules`**: `document (PK), category, updated_at` — CNPJ/CPF → category, learned from
  user corrections (see Category engine below).

Tests that spin up an in-memory `DatabaseSync` (`:memory:`) must recreate this schema by hand — grep
for `CREATE TABLE transactions` across `__tests__/` files if you change the schema, there are several
copies to keep in sync (no shared test helper for this yet).

## Category engine (layered, not ML)

`CategoryEngine.processTransaction(payload, db?)` resolves a category in this order:

1. **Merchant rule** — if `db` is passed and `payload.document` (the counterparty's CNPJ/CPF) has a
   saved rule in `merchant_rules`, use it. Rules are written automatically whenever a transaction is
   created/updated with a manually-chosen non-"Outros" category and a `document`.
2. **Keyword matching** — `CATEGORY_KEYWORDS` hardcoded list, description normalized (accents
   stripped, lowercased) via `normalizeText`. Keywords must match as a **standalone word** — a
   lookaround regex `(?<![a-z0-9])keyword(?![a-z0-9])`, not `\b` (which doesn't split digit-digit)
   and not plain `.includes()` (which used to false-positive: `'99'` matched inside any account
   number containing those two digits, `'gas'` matched inside surnames like "Campagnolo" — fixed
   2026-07-24). Watch for keywords that are substrings of unrelated bank-generated phrasing: `'pagamento'`
   under `Receita` used to match `PAGAMENTO PIX - ...` (a Sicredi **debit** description prefix),
   miscategorizing real expenses as income during CSV import — replaced with `'recebimento'` (fixed
   2026-07-24, see `RECEBIMENTO PIX` vs `PAGAMENTO PIX` prefixes in the Sicredi export).
3. **"Outros"** if nothing matches.

This is deliberately rule-based, not statistical — see the project's memory notes if this comes up
again ("basicamente um machine learning?" was asked and answered: no, it's rules + memoization, which
is the right tradeoff at this transaction volume).

`#conjunto` anywhere in a description (case-insensitive, word boundary) sets
`investment_type: 'Conjunto'` — same regex duplicated in `categoryEngine.ts` and
`TransactionForm.tsx`.

## Statement import (CSV)

Added 2026-07-24. Flow: upload → preview (parse + suggest category + flag duplicates, nothing
written) → user reviews/edits categories in the browser → confirm (writes, skips already-imported
`external_id`s).

- `lib/services/statementParser.ts` — parses the Sicredi bank CSV export: `;`-separated, BOM-prefixed,
  `R$`/comma-decimal amounts, `DD/MM/YYYY` dates, and extracts the counterparty's CNPJ/CPF from the
  description via `\b(\d{11}|\d{14})\b`. If you need to support a different bank's export format,
  this is the file to branch or extend — it's bank-specific by design, not a generic CSV parser.
- `lib/services/statementImportService.ts` — `preview()` (read-only) and `confirm()` (writes via
  `TransactionService.createTransaction`, which handles the dedup + merchant-rule-learning side
  effects already).
- `POST /api/import/preview` and `POST /api/import/confirm`, UI at `app/import/page.tsx`.

## API routes

- `GET /api/transactions` — paginated: `{data: {items, total, page, page_size}}` (not a bare array —
  this shape changed 2026-07-23, don't regress it).
- `POST /api/transactions` — accepts optional `external_id` (dedup key) and `document` (triggers
  merchant-rule learning) in the payload.
- `PATCH /api/transactions/[id]`, `DELETE /api/transactions/[id]`.
- `TransactionService.getTransactions` (no pagination, `MAX_RESULTS = 500` cap) is intentionally kept
  separate from `getTransactionsPage` — `SummaryService` and the dashboard charts need the *whole*
  period's transactions to compute totals, not one page. Don't collapse these into one method.
- `POST /api/import/preview`, `POST /api/import/confirm` (see above).

## Things intentionally NOT done (don't suggest re-adding without asking)

- **No rate limiting / security hardening.** App is local-only, no deploy planned. Revisit only if
  the user decides to deploy externally.
- **No E2E tests (Playwright).** Conscious scope decision.
- **No dedicated `/investments` page** — investment data lives only in the dashboard's
  `InvestmentTimelineChart`. Decision on whether to build a dedicated page is still open/deferred.
- **No consolidation of `useSummary` + `useTransactions`** into one endpoint — dashboard still fires
  two separate HTTP queries, kept that way on purpose.

## Working conventions for this repo

- **Never put real PII in code, tests, or fixtures** — not even temporarily, not even if the user
  pasted a real bank statement/CPF/name for you to analyze. Use obviously fake values
  (`11122233396`, `Fulano da Silva`, `11222333000181`). This bit the project once (2026-07-24): a
  real CPF and a third party's real name/CNPJ ended up in test files and had to be scrubbed.
- When changing the `transactions` or `merchant_rules` schema, update **both** `lib/db/client.ts`
  and every in-memory test DB setup that duplicates the `CREATE TABLE` statements.
- No Playwright/chromium-cli available in this environment — manual UI verification is done by
  curling the dev server's API routes directly (`npm run dev` in background, then `curl`), not by
  clicking through the browser. Say so explicitly if you couldn't visually verify a UI change.
- This project has an Obsidian "second brain" vault at
  `C:\Users\User\Documents\Projetos\segundo-cerebro\Projetos\FluxCash\` (Visão Geral, Arquitetura,
  Decisões, Log de Mudanças) that should be kept up to date with any non-trivial change, automatically,
  without asking first.
