# 💸🌙 FluxCash — Personal Finance Manager

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Status: Active (local-only)](https://img.shields.io/badge/status-active%20(local--only)-brightgreen.svg)](#)

**FluxCash** is a personal financial management app for tracking income, expenses, and investments, with automatic transaction categorization and a dashboard of KPIs and charts. It runs **100% locally** — no cloud, no auth, no external services — built as a learning project (Systems Analysis and Development).

> Originally built with Python/Streamlit, then migrated to React/Next.js. Was briefly on Supabase (Postgres + cloud auth), then migrated again to a fully local SQLite setup, since this is a single-user app with no need for multi-user support or cloud data.

---

## ⚡ Quick Start

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:3000`.

No environment variables, database server, or account setup required — data is stored in a local SQLite file via Node's native `node:sqlite`.

---

## ✨ Features

* **Automatic transaction categorization, in layers** — a saved rule by the counterparty's CNPJ/CPF (learned from your manual corrections) takes priority, then a keyword-matching engine reads descriptions (e.g. `UBER *TRIP`, `NETFLIX COM`) and maps them to categories (Alimentação, Transporte, Saúde, Educação, Lazer, Moradia, Investimento, Receita, Outros).
* **CSV statement import** — upload a bank statement CSV (currently Sicredi's export format), review/adjust the suggested category per row, and confirm; duplicate re-imports are detected and skipped automatically.
* **Full transaction CRUD** — create, edit, and delete directly from the transactions table (inline row actions + modals), with filtering by date range, type, category, and text search.
* **Real pagination** — the transaction list and API are properly paginated (no more silent 500-row cutoffs).
* **Dashboard with KPIs and charts** — income/expense bar chart, expense breakdown donut, cumulative balance area chart, and investment timeline (via Recharts).
* **Shared-contribution tag** — `#conjunto` in a description marks a transaction as part of a joint/shared investment.
* **Responsive layout** — sidebar collapses into a mobile drawer with overlay.

### Known limitations (by design, for now)
* CSV import only supports Sicredi's export format so far — no OFX, no other banks yet.
* No recurring transactions, no E2E tests (Playwright).
* No dedicated `/investments` page — investment data currently lives only in the dashboard timeline chart.
* No rate limiting or security hardening — intentionally out of scope while the app runs local-only with no deploy planned.

---

## 🛠️ Technology Stack

* **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
* **Styling:** Tailwind CSS 4
* **Data:** SQLite via `node:sqlite` (native, experimental) — no Supabase, no auth, no cloud
* **Validation:** Zod
* **Server state:** TanStack React Query
* **Forms:** React Hook Form
* **Charts:** Recharts
* **Testing:** Jest + React Testing Library (99 tests — services, API routes, components, integration)

---

## 📁 Project Structure (`app/`)

```
app/
├── app/                    # Next.js App Router
│   ├── dashboard/          # KPIs + charts
│   ├── transactions/       # table, filters, create/edit form
│   ├── import/             # CSV statement import (upload + review)
│   └── api/
│       ├── transactions/   # GET (paginated), POST, PATCH/DELETE by id
│       ├── import/         # preview + confirm for statement import
│       └── summary/        # dashboard summary data
├── components/
│   ├── dashboard/          # KPICards + 4 charts
│   ├── transactions/       # TransactionTable, Filters, Form
│   ├── layout/             # Header, Sidebar (mobile drawer), MainLayout
│   └── ui/                 # Button, Input, Select, Card, Toast, Modal, ...
├── contexts/               # ToastContext, QueryProvider
├── hooks/                  # useTransactions, useTransactionMutations, useSummary, useToast, useStatementImport
├── lib/
│   ├── db/                 # local SQLite client
│   ├── services/           # transactionService, summaryService, categoryEngine, merchantRuleService, statementParser, statementImportService
│   ├── validation/         # Zod schemas
│   └── utils/              # formatters, text normalization
└── types/
```

---

## 🎨 Theme

Dark/neon palette: background `#0d1117`, cards `#161b22`, primary `#4ade80`, income `#22c55e`, expense `#f87171`, investment `#fbbf24`.

---

## 🧪 Testing

```bash
cd app
npm test
```

99 tests across Jest environments `jsdom` (components) and `node` (API routes, via `@jest-environment node`).

---

## 📧 Contact

Developed by **Pedro Campagnolo**.
