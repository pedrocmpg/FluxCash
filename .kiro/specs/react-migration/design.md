# Design Document: FluxCash React Migration

## Overview

This design document specifies the technical architecture for migrating FluxCash from a Python/Streamlit application to a modern React-based web application. The migration preserves all existing functionality while modernizing the tech stack to improve maintainability, performance, and deployment flexibility.

### Design Goals

1. **Zero Data Migration**: Reuse existing Supabase PostgreSQL database without schema changes
2. **Feature Parity**: Maintain all functionality from the Streamlit version
3. **Modern Architecture**: Implement React 18+ with functional components and hooks
4. **Cloud-Native Deployment**: Optimize for Vercel serverless deployment
5. **Visual Consistency**: Preserve the dark/neon theme and design language
6. **Performance**: Achieve Lighthouse score >= 85

### Technology Stack

**Frontend:**
- React 18.2+ with functional components
- React Router v6 for client-side routing
- Styled-components for CSS-in-JS styling
- Recharts for data visualization
- Axios for HTTP requests
- React Hook Form for form management

**Backend:**
- Next.js 14+ (App Router) for unified frontend and API
- Supabase JavaScript Client (@supabase/supabase-js)
- Zod for runtime validation
- Node.js 18+ runtime environment

**Infrastructure:**
- Supabase (existing): PostgreSQL database + Authentication
- Vercel: Hosting and serverless functions
- Environment variables for configuration


## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel Platform                        │
│                                                             │
│  ┌────────────────────────┐     ┌────────────────────────┐ │
│  │   React Frontend       │     │   Next.js API Routes   │ │
│  │  (Static + Hydrated)   │────▶│   (Serverless)         │ │
│  │                        │     │                        │ │
│  │  - Dashboard           │     │  - /api/auth/*         │ │
│  │  - Transactions        │     │  - /api/transactions/* │ │
│  │  - Auth Pages          │     │  - /api/summary        │ │
│  └────────────────────────┘     └────────────┬───────────┘ │
│                                               │             │
└───────────────────────────────────────────────┼─────────────┘
                                                │
                                                ▼
                               ┌────────────────────────────┐
                               │   Supabase Services        │
                               │                            │
                               │  - PostgreSQL Database     │
                               │  - Authentication (JWT)    │
                               │  - Row Level Security      │
                               └────────────────────────────┘
```

### Application Architecture Layers

**1. Presentation Layer (React Components)**
- Page components (Dashboard, Transactions, Login)
- Feature components (TransactionForm, KPICards, Charts)
- UI components (Button, Input, Card, Modal)
- Layout components (Header, Sidebar, AuthGuard)

**2. State Management Layer**
- React Context for global state (AuthContext, TransactionContext)
- React Query for server state caching
- Local state with useState/useReducer


**3. API Layer (Next.js API Routes)**
- Authentication endpoints
- Transaction CRUD endpoints
- Dashboard summary endpoint
- Middleware for authentication and validation

**4. Data Access Layer**
- Supabase client wrapper
- Transaction service
- Auth service
- Category engine

**5. External Services**
- Supabase PostgreSQL (persistence)
- Supabase Auth (user management)

### Directory Structure

```
fluxcash-react/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── transactions/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── register/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── transactions/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── summary/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── dashboard/
│   │   │   ├── KPICards.tsx
│   │   │   ├── IncomeExpenseBarChart.tsx
│   │   │   ├── ExpenseDonutChart.tsx
│   │   │   ├── BalanceTrendChart.tsx
│   │   │   └── InvestmentTimelineChart.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionTable.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TransactionFilters.tsx
│   │   │   └── DeleteTransactionForm.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Select.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── Toast.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── services/
│   │   │   ├── transactionService.ts
│   │   │   ├── authService.ts
│   │   │   ├── categoryEngine.ts
│   │   │   └── summaryService.ts
│   │   ├── validation/
│   │   │   └── schemas.ts
│   │   └── utils/
│   │       ├── formatters.ts
│   │       ├── normalizeText.ts
│   │       └── dateHelpers.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTransactions.ts
│   │   ├── useSummary.ts
│   │   └── useToast.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── types/
│   │   ├── transaction.ts
│   │   ├── summary.ts
│   │   └── api.ts
│   └── styles/
│       ├── theme.ts
│       └── globalStyles.ts
├── public/
│   └── favicon.ico
├── .env.local
├── .env.example
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```


## Components and Interfaces

### Core Type Definitions

```typescript
// types/transaction.ts
export type TransactionType = 'receita' | 'despesa';

export type InvestmentType = 'Individual' | 'Conjunto' | 'N/A';

export type Category = 
  | 'Alimentação' 
  | 'Transporte' 
  | 'Saúde' 
  | 'Educação' 
  | 'Lazer' 
  | 'Moradia' 
  | 'Investimento' 
  | 'Receita' 
  | 'Outros';

export interface Transaction {
  id: string;
  value: number;
  description: string;
  category: Category;
  type: TransactionType;
  investment_type: InvestmentType;
  timestamp: string; // ISO 8601
  user_id: string;
}

export interface TransactionCreate {
  value: number;
  description: string;
  category?: Category;
  type: TransactionType;
  investment_type?: InvestmentType;
}

// types/summary.ts
export interface DashboardSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  total_investment: number;
  expense_by_category: Record<Category, number>;
  income_by_category: Record<Category, number>;
  period_start?: string;
  period_end?: string;
}

// types/api.ts
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  type?: TransactionType;
  category?: Category;
}
```


### Component Interface Specifications

#### 1. Authentication Components

**AuthGuard Component**
```typescript
interface AuthGuardProps {
  children: React.ReactNode;
}

// Responsibilities:
// - Check authentication status via AuthContext
// - Redirect to /login if not authenticated
// - Display loading state during auth check
// - Wrap protected routes
```

**LoginForm Component**
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
}

// Responsibilities:
// - Render email and password input fields
// - Validate input client-side (email format, password length)
// - Submit credentials to /api/auth/login
// - Display error messages
// - Store JWT token on success
// - Implement rate limiting UI feedback
```

**RegisterForm Component**
```typescript
interface RegisterFormProps {
  onSuccess?: () => void;
}

// Responsibilities:
// - Render email, password, and confirm password fields
// - Validate password strength (8+ chars, uppercase, lowercase, number)
// - Ensure password and confirm password match
// - Submit to /api/auth/register
// - Display validation errors
// - Redirect to dashboard on success
```


#### 2. Dashboard Components

**KPICards Component**
```typescript
interface KPICardsProps {
  summary: DashboardSummary;
  loading?: boolean;
}

// Responsibilities:
// - Render 4 KPI cards in a responsive grid
// - Display: Total Receitas, Total Despesas, Saldo, Total Investimentos
// - Format values as Brazilian Real (R$ X.XXX,XX)
// - Apply color coding: green (income), red (expense), yellow (investment), blue (balance)
// - Show appropriate icons for each metric
// - Display loading skeleton while data loads
```

**IncomeExpenseBarChart Component**
```typescript
interface IncomeExpenseBarChartProps {
  transactions: Transaction[];
  groupBy?: 'month' | 'week' | 'day';
}

// Responsibilities:
// - Group transactions by time period (default: month)
// - Calculate total income and expense per period
// - Render grouped bar chart using Recharts
// - Use green bars for income, red bars for expense
// - Format Y-axis as Brazilian Real
// - Display hover tooltips with exact values
// - Show "Sem dados para o período" when empty
```

**ExpenseDonutChart Component**
```typescript
interface ExpenseDonutChartProps {
  transactions: Transaction[];
}

// Responsibilities:
// - Filter transactions where type = 'despesa'
// - Aggregate expenses by category
// - Render donut chart (55% inner radius) using Recharts
// - Display category name, value, and percentage in tooltips
// - Use distinct colors for each category
// - Show "Sem despesas no período" when empty
```

**BalanceTrendChart Component**
```typescript
interface BalanceTrendChartProps {
  transactions: Transaction[];
}

// Responsibilities:
// - Sort transactions chronologically
// - Calculate cumulative balance (income positive, expense negative)
// - Render area chart using Recharts
// - Fill area with semi-transparent green (#4ade8026)
// - Draw line in solid primary green (#4ade80)
// - Format X-axis as DD/MM/YYYY
// - Display tooltips with date and balance
// - Show "Sem dados para o período" when empty
```

**InvestmentTimelineChart Component**
```typescript
interface InvestmentTimelineChartProps {
  transactions: Transaction[];
}

// Responsibilities:
// - Filter transactions where investment_type = 'Individual' OR 'Conjunto'
// - Sort transactions chronologically
// - Render line chart with markers using Recharts
// - Use yellow color (#fbbf24) for line
// - Differentiate Individual (circle) vs Conjunto (diamond) markers
// - Display tooltips with date, value, and investment type
// - Show "Sem investimentos no período" when empty
```


#### 3. Transaction Components

**TransactionTable Component**
```typescript
interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

// Responsibilities:
// - Render responsive table with columns: ID, Data, Descrição, Categoria, Tipo, Valor, Investimento
// - Format Data as DD/MM/YYYY HH:MM
// - Format Valor with R$ prefix and 2 decimals
// - Apply color coding to Tipo (green for receita, red for despesa)
// - Display joint transaction badge for Conjunto investments
// - Show loading skeleton while data loads
// - Display "Nenhuma transação encontrada" when empty
// - Include summary row with sum of receitas, despesas, and saldo
// - Enable horizontal scroll on mobile devices
```

**TransactionForm Component**
```typescript
interface TransactionFormProps {
  onSuccess?: (transaction: Transaction) => void;
}

// Responsibilities:
// - Render form with fields: valor, descrição, categoria, tipo, investment_type
// - Validate valor > 0 client-side
// - Validate descrição length (1-200 chars)
// - Populate categoria dropdown with all categories
// - Default investment_type to "N/A"
// - Display hint when #conjunto detected in descrição
// - Submit to POST /api/transactions
// - Clear form on success
// - Display toast notification on success/error
// - Trigger parent refresh callback
```

**TransactionFilters Component**
```typescript
interface TransactionFiltersProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

// Responsibilities:
// - Render filter controls: start_date, end_date, type
// - Validate start_date <= end_date
// - Emit onChange event when filters change
// - Provide "Clear filters" button
// - Display active filter count badge
```

**DeleteTransactionForm Component**
```typescript
interface DeleteTransactionFormProps {
  onSuccess?: () => void;
}

// Responsibilities:
// - Render expandable section for deletion
// - Accept transaction ID input field
// - Validate UUID format
// - Require confirmation checkbox
// - Display warning message when checkbox checked
// - Send DELETE /api/transactions/:id
// - Display success toast and trigger refresh
// - Display validation error for invalid UUID
```


#### 4. Layout Components

**Header Component**
```typescript
interface HeaderProps {
  user?: { email: string };
  onLogout: () => void;
}

// Responsibilities:
// - Display FluxCash logo and title
// - Show user avatar and email
// - Provide logout button
// - Responsive navigation menu
```

**Sidebar Component**
```typescript
interface SidebarProps {
  activeRoute: string;
}

// Responsibilities:
// - Render navigation links (Dashboard, Transactions)
// - Highlight active route
// - Collapse on mobile devices
// - Display user info at top
```

**MainLayout Component**
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
}

// Responsibilities:
// - Compose Header, Sidebar, and main content area
// - Apply consistent spacing and layout structure
// - Wrap with AuthGuard for protected routes
```


### Service Layer Interfaces

#### TransactionService

```typescript
// lib/services/transactionService.ts
export class TransactionService {
  /**
   * Fetch transactions with optional filters
   * @param filters - Date range, type, and category filters
   * @returns Promise<Transaction[]>
   */
  static async getTransactions(
    filters?: TransactionFilters
  ): Promise<Transaction[]>;

  /**
   * Create a new transaction
   * @param payload - Transaction data without id/timestamp
   * @returns Promise<Transaction>
   */
  static async createTransaction(
    payload: TransactionCreate
  ): Promise<Transaction>;

  /**
   * Delete transaction by ID
   * @param id - Transaction UUID
   * @returns Promise<void>
   */
  static async deleteTransaction(id: string): Promise<void>;
}
```

#### CategoryEngine

```typescript
// lib/services/categoryEngine.ts
export class CategoryEngine {
  /**
   * Suggest category based on description keywords
   * @param description - Transaction description
   * @returns Category
   */
  static suggestCategory(description: string): Category;

  /**
   * Detect if transaction is joint based on #conjunto tag
   * @param description - Transaction description
   * @returns boolean
   */
  static isJointTransaction(description: string): boolean;

  /**
   * Determine investment type from description
   * @param description - Transaction description
   * @returns InvestmentType
   */
  static detectInvestmentType(description: string): InvestmentType;

  /**
   * Process and enrich transaction before creation
   * @param payload - Raw transaction data
   * @returns TransactionCreate with enriched fields
   */
  static processTransaction(
    payload: Partial<TransactionCreate>
  ): TransactionCreate;
}
```


#### SummaryService

```typescript
// lib/services/summaryService.ts
export class SummaryService {
  /**
   * Calculate dashboard summary metrics
   * @param filters - Date range filters
   * @returns Promise<DashboardSummary>
   */
  static async getSummary(
    filters?: Pick<TransactionFilters, 'start_date' | 'end_date'>
  ): Promise<DashboardSummary>;
}
```

#### AuthService

```typescript
// lib/services/authService.ts
export class AuthService {
  /**
   * Authenticate user with email and password
   * @param email - User email
   * @param password - User password
   * @returns Promise<{ token: string; user: User }>
   */
  static async login(
    email: string, 
    password: string
  ): Promise<{ token: string; user: User }>;

  /**
   * Register new user account
   * @param email - User email
   * @param password - User password
   * @returns Promise<{ token: string; user: User }>
   */
  static async register(
    email: string, 
    password: string
  ): Promise<{ token: string; user: User }>;

  /**
   * Sign out current user
   * @returns Promise<void>
   */
  static async logout(): Promise<void>;

  /**
   * Get current authenticated user
   * @returns Promise<User | null>
   */
  static async getCurrentUser(): Promise<User | null>;
}
```


### API Endpoints Specification

#### Authentication Endpoints

**POST /api/auth/login**
```typescript
Request Body:
{
  email: string;      // Valid email format
  password: string;   // Min 8 characters
}

Response 200:
{
  data: {
    token: string;
    user: {
      id: string;
      email: string;
    }
  }
}

Response 400:
{
  error: "Invalid credentials" // Generic message for security
}

Response 429:
{
  error: "Too many login attempts. Please try again in 15 minutes"
}
```

**POST /api/auth/register**
```typescript
Request Body:
{
  email: string;      // Valid email format
  password: string;   // Min 8 chars, uppercase, lowercase, number
}

Response 201:
{
  data: {
    token: string;
    user: {
      id: string;
      email: string;
    }
  }
}

Response 400:
{
  error: "Password must contain at least 8 characters, one uppercase, one lowercase, and one number"
}

Response 409:
{
  error: "Email already registered"
}
```

**POST /api/auth/logout**
```typescript
Response 200:
{
  data: { message: "Logged out successfully" }
}
```


#### Transaction Endpoints

**GET /api/transactions**
```typescript
Query Parameters:
{
  start_date?: string;    // ISO 8601 date (YYYY-MM-DD)
  end_date?: string;      // ISO 8601 date (YYYY-MM-DD)
  type?: 'receita' | 'despesa';
  category?: Category;
}

Response 200:
{
  data: Transaction[]     // Max 500 records, ordered by timestamp DESC
}

Response 401:
{
  error: "Unauthorized"
}

Response 500:
{
  error: "Internal server error"
}
```

**POST /api/transactions**
```typescript
Request Body:
{
  value: number;              // Must be > 0
  description: string;        // 1-200 chars
  category?: Category;        // Optional, auto-categorized if not provided
  type: 'receita' | 'despesa';
  investment_type?: InvestmentType; // Optional, defaults to 'N/A'
}

Response 201:
{
  data: Transaction           // Includes generated id and timestamp
}

Response 400:
{
  error: "Value must be greater than zero"
}

Response 401:
{
  error: "Unauthorized"
}
```

**DELETE /api/transactions/[id]**
```typescript
Path Parameter:
  id: string                  // UUID format

Response 200:
{
  data: { message: "Transaction deleted successfully" }
}

Response 400:
{
  error: "Invalid transaction ID format"
}

Response 403:
{
  error: "Forbidden: Cannot delete another user's transaction"
}

Response 404:
{
  error: "Transaction not found"
}

Response 401:
{
  error: "Unauthorized"
}
```


#### Summary Endpoint

**GET /api/summary**
```typescript
Query Parameters:
{
  start_date?: string;    // ISO 8601 date
  end_date?: string;      // ISO 8601 date
}

Response 200:
{
  data: {
    total_income: number;
    total_expense: number;
    balance: number;
    total_investment: number;
    expense_by_category: Record<Category, number>;
    income_by_category: Record<Category, number>;
    period_start?: string;
    period_end?: string;
  }
}

Response 401:
{
  error: "Unauthorized"
}
```


## Data Models

### Database Schema (Existing - No Changes)

**transactions table**
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  value FLOAT NOT NULL CHECK (value > 0),
  description VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('receita', 'despesa')),
  investment_type VARCHAR(20) NOT NULL DEFAULT 'N/A' 
    CHECK (investment_type IN ('Individual', 'Conjunto', 'N/A')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Row Level Security Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
```

### Validation Schemas (Zod)

```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const TransactionCreateSchema = z.object({
  value: z.number().positive('Value must be greater than zero'),
  description: z.string().min(1).max(200, 'Description must be 1-200 characters'),
  category: z.enum([
    'Alimentação',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Moradia',
    'Investimento',
    'Receita',
    'Outros'
  ]).optional(),
  type: z.enum(['receita', 'despesa']),
  investment_type: z.enum(['Individual', 'Conjunto', 'N/A']).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const TransactionFiltersSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  type: z.enum(['receita', 'despesa']).optional(),
  category: z.string().optional(),
});

export const UUIDSchema = z.string().uuid('Invalid UUID format');
```


## Data Flow

### Authentication Flow

```
1. User submits login form
   ↓
2. LoginForm validates input client-side
   ↓
3. POST /api/auth/login with credentials
   ↓
4. API route validates with Zod schema
   ↓
5. AuthService.login() calls Supabase Auth
   ↓
6. Supabase returns JWT token + user data
   ↓
7. API route sets httpOnly cookie with token
   ↓
8. Response includes user data
   ↓
9. AuthContext updates global state
   ↓
10. Redirect to /dashboard
```

### Transaction Creation Flow

```
1. User fills out TransactionForm
   ↓
2. Client-side validation (value > 0, description length)
   ↓
3. CategoryEngine.processTransaction() suggests category and detects #conjunto
   ↓
4. POST /api/transactions with enriched payload
   ↓
5. API route validates with Zod schema
   ↓
6. Extract user_id from JWT token
   ↓
7. TransactionService.createTransaction() calls Supabase
   ↓
8. Supabase validates RLS policy (user can insert own transactions)
   ↓
9. Database generates id and timestamp
   ↓
10. Response includes complete Transaction object
    ↓
11. Frontend displays success toast
    ↓
12. Clear form and trigger data refresh
    ↓
13. Dashboard and Transactions page update via React Query cache invalidation
```


### Dashboard Data Flow

```
1. User navigates to /dashboard
   ↓
2. AuthGuard verifies authentication
   ↓
3. Dashboard page mounts
   ↓
4. Parallel data fetching:
   ├── GET /api/transactions (with date filters if applied)
   └── GET /api/summary (with date filters if applied)
   ↓
5. API routes extract user_id from JWT
   ↓
6. Supabase queries with RLS enforcement:
   ├── TransactionService.getTransactions()
   └── SummaryService.getSummary()
   ↓
7. Data returned to frontend
   ↓
8. React Query caches responses
   ↓
9. Components receive data via props:
   ├── KPICards renders metrics
   ├── IncomeExpenseBarChart processes and visualizes
   ├── ExpenseDonutChart filters and aggregates
   ├── BalanceTrendChart calculates cumulative balance
   └── InvestmentTimelineChart filters investments
   ↓
10. User interacts with filters
    ↓
11. Filter state updates trigger new API requests
    ↓
12. React Query invalidates cache and refetches
    ↓
13. Charts update with new data
```

### Transaction Deletion Flow

```
1. User enters transaction ID in DeleteTransactionForm
   ↓
2. Client validates UUID format
   ↓
3. User checks confirmation checkbox
   ↓
4. Warning message displays
   ↓
5. User clicks delete button
   ↓
6. DELETE /api/transactions/[id]
   ↓
7. API route validates UUID with Zod
   ↓
8. Extract user_id from JWT
   ↓
9. TransactionService.deleteTransaction()
   ↓
10. Supabase RLS policy ensures user can only delete own transactions
    ↓
11. If transaction not found: 404 error
    ↓
12. If user_id mismatch: 403 error
    ↓
13. Success: 200 response
    ↓
14. Frontend displays success toast
    ↓
15. Clear form
    ↓
16. Invalidate React Query cache
    ↓
17. Dashboard and Transactions page refresh automatically
```


## Implementation Details

### Category Engine Algorithm

```typescript
// lib/services/categoryEngine.ts
import { Category, InvestmentType } from '@/types/transaction';

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Alimentação: [
    'mercado', 'supermercado', 'restaurante', 'lanche',
    'ifood', 'padaria', 'acougue', 'feira'
  ],
  Transporte: [
    'uber', '99', 'onibus', 'metro', 'gasolina',
    'combustivel', 'estacionamento', 'pedagio'
  ],
  Saúde: [
    'farmacia', 'medico', 'consulta', 'hospital',
    'plano de saude', 'exame', 'dentista'
  ],
  Educação: [
    'curso', 'faculdade', 'livro', 'escola',
    'mensalidade', 'udemy', 'alura', 'treinamento'
  ],
  Lazer: [
    'cinema', 'netflix', 'spotify', 'show',
    'viagem', 'hotel', 'jogo', 'streaming'
  ],
  Moradia: [
    'aluguel', 'condominio', 'agua', 'luz',
    'energia', 'internet', 'gas', 'iptu'
  ],
  Investimento: [
    'tesouro', 'acoes', 'fundo', 'cdb',
    'poupanca', 'cripto', 'dividendo', 'acao'
  ],
  Receita: [
    'salario', 'freelance', 'renda', 'pagamento',
    'transferencia recebida', 'bonus'
  ],
  Outros: [],
};

const CONJUNTO_REGEX = /#conjunto\b/i;

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim();
}

export class CategoryEngine {
  static suggestCategory(description: string): Category {
    const normalized = normalizeText(description);
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => normalized.includes(keyword))) {
        return category as Category;
      }
    }
    
    return 'Outros';
  }

  static isJointTransaction(description: string): boolean {
    return CONJUNTO_REGEX.test(description);
  }

  static detectInvestmentType(description: string): InvestmentType {
    return this.isJointTransaction(description) ? 'Conjunto' : 'N/A';
  }

  static processTransaction(
    payload: Partial<TransactionCreate>
  ): TransactionCreate {
    const category = payload.category || this.suggestCategory(payload.description || '');
    const investment_type = payload.investment_type || 
      this.detectInvestmentType(payload.description || '');

    return {
      ...payload,
      category,
      investment_type,
    } as TransactionCreate;
  }
}
```


### Authentication Middleware

```typescript
// app/api/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
) {
  const supabase = createServerClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return handler(request, user.id);
}
```

### Rate Limiting Implementation

```typescript
// lib/utils/rateLimiter.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export class RateLimiter {
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_ATTEMPTS = 5;

  static async checkLimit(identifier: string): Promise<boolean> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;

    // Remove old attempts
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count attempts in window
    const attempts = await redis.zcount(key, windowStart, now);

    if (attempts >= this.MAX_ATTEMPTS) {
      return false; // Rate limit exceeded
    }

    // Record this attempt
    await redis.zadd(key, { score: now, member: now.toString() });
    await redis.expire(key, Math.ceil(this.WINDOW_MS / 1000));

    return true; // Within limit
  }

  static async getRemainingAttempts(identifier: string): Promise<number> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;

    await redis.zremrangebyscore(key, 0, windowStart);
    const attempts = await redis.zcount(key, windowStart, now);

    return Math.max(0, this.MAX_ATTEMPTS - attempts);
  }
}
```


### Supabase Client Configuration

```typescript
// lib/supabase/client.ts (Browser)
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/server.ts (Server Components & API Routes)
import { cookies } from 'next/headers';
import { createServerClient as createClient } from '@supabase/ssr';

export function createServerClient() {
  const cookieStore = cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

### React Context Setup

```typescript
// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```


### Theme Configuration

```typescript
// styles/theme.ts
export const theme = {
  colors: {
    // Background
    bgDark: '#0f172a',      // Slate 900
    bgCard: '#1e293b',      // Slate 800
    border: '#334155',      // Slate 700
    
    // Text
    text: '#f1f5f9',        // Slate 100
    textSecondary: '#94a3b8', // Slate 400
    
    // Brand
    primary: '#4ade80',     // Green 400 (neon green)
    primaryHover: '#22c55e', // Green 500
    
    // Semantic
    income: '#22c55e',      // Green 500
    expense: '#f87171',     // Red 400
    investment: '#fbbf24',  // Yellow 400
    balance: '#60a5fa',     // Blue 400
    
    // Neutral
    neutral: '#94a3b8',     // Slate 400
    
    // Status
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    neon: '0 0 20px rgba(74, 222, 128, 0.3)',
  },
};

export type Theme = typeof theme;
```


## Error Handling

### Error Handling Strategy

**1. API Route Error Handling**
```typescript
// Example: app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { PostgrestError } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Business logic here
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    // Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    // Supabase/Postgres errors
    if (error && typeof error === 'object' && 'code' in error) {
      const pgError = error as PostgrestError;
      
      if (pgError.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Resource already exists' },
          { status: 409 }
        );
      }
      
      if (pgError.code === '23503') { // Foreign key violation
        return NextResponse.json(
          { error: 'Referenced resource not found' },
          { status: 404 }
        );
      }
    }
    
    // Generic server error
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**2. Frontend Error Handling**
```typescript
// hooks/useTransactions.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TransactionService } from '@/lib/services/transactionService';
import { useToast } from '@/hooks/useToast';

export function useTransactions(filters?: TransactionFilters) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => TransactionService.getTransactions(filters),
    retry: 1,
    onError: (error: Error) => {
      showToast({
        type: 'error',
        message: error.message || 'Failed to load transactions',
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: TransactionService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['summary']);
      showToast({
        type: 'success',
        message: '✅ Transaction created successfully',
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        message: error.message || 'Failed to create transaction',
      });
    },
  });

  return {
    transactions: data || [],
    isLoading,
    error,
    createTransaction: createMutation.mutate,
  };
}
```


**3. Loading States**
```typescript
// components/ui/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

// components/dashboard/KPICards.tsx
export function KPICards({ summary, loading }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-bgCard p-6 rounded-lg animate-pulse">
            <div className="h-4 bg-neutral rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-neutral rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    // Actual content
  );
}
```

**4. Error Boundaries**
```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen bg-bgDark text-text p-8">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-textSecondary mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-bgDark rounded-lg hover:bg-primaryHover"
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```


## Testing Strategy

### Testing Approach

The FluxCash React migration will use a comprehensive testing strategy with unit tests and integration tests.

**Testing Libraries:**
- Jest: Test runner and assertion library
- React Testing Library: Component testing
- MSW (Mock Service Worker): API mocking for integration tests
- Supertest: API route testing (optional for Next.js API routes)

**Test Categories:**

**1. Unit Tests**
- Utility functions (formatters, normalizeText, dateHelpers)
- CategoryEngine logic (keyword matching, #conjunto detection)
- Validation schemas (Zod schemas)
- Individual component logic (not full renders)

**2. Integration Tests**
- API route handlers with database mocks
- Form submission flows (TransactionForm, LoginForm)
- Authentication flows (login, register, logout)
- Data fetching hooks (useTransactions, useSummary)

**3. Component Tests**
- KPICards rendering with different data
- Chart components with empty/populated data
- TransactionTable with various filter states
- Form validation and error display
- AuthGuard redirect behavior

**4. End-to-End Tests (Future Phase)**
- Not included in initial migration
- Can be added later with Playwright or Cypress

### Test Examples

**Unit Test: CategoryEngine**
```typescript
// lib/services/__tests__/categoryEngine.test.ts
import { CategoryEngine } from '../categoryEngine';

describe('CategoryEngine', () => {
  describe('suggestCategory', () => {
    it('should categorize "supermercado" as Alimentação', () => {
      expect(CategoryEngine.suggestCategory('Compra no supermercado')).toBe('Alimentação');
    });

    it('should categorize "uber" as Transporte', () => {
      expect(CategoryEngine.suggestCategory('Corrida de Uber')).toBe('Transporte');
    });

    it('should return Outros for unmatched keywords', () => {
      expect(CategoryEngine.suggestCategory('Random description')).toBe('Outros');
    });

    it('should handle accents correctly', () => {
      expect(CategoryEngine.suggestCategory('Compra no açougue')).toBe('Alimentação');
    });
  });

  describe('isJointTransaction', () => {
    it('should detect #conjunto tag', () => {
      expect(CategoryEngine.isJointTransaction('Compra no mercado #conjunto')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(CategoryEngine.isJointTransaction('Aluguel #CONJUNTO')).toBe(true);
    });

    it('should return false when tag is absent', () => {
      expect(CategoryEngine.isJointTransaction('Compra pessoal')).toBe(false);
    });
  });
});
```


**Component Test: KPICards**
```typescript
// components/dashboard/__tests__/KPICards.test.tsx
import { render, screen } from '@testing-library/react';
import { KPICards } from '../KPICards';
import { DashboardSummary } from '@/types/summary';

describe('KPICards', () => {
  const mockSummary: DashboardSummary = {
    total_income: 5000,
    total_expense: 3000,
    balance: 2000,
    total_investment: 1000,
    expense_by_category: {},
    income_by_category: {},
  };

  it('should render all 4 KPI cards', () => {
    render(<KPICards summary={mockSummary} />);
    
    expect(screen.getByText(/Total Receitas/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Despesas/i)).toBeInTheDocument();
    expect(screen.getByText(/Saldo/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Investimentos/i)).toBeInTheDocument();
  });

  it('should format values as Brazilian Real', () => {
    render(<KPICards summary={mockSummary} />);
    
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 3.000,00')).toBeInTheDocument();
  });

  it('should display loading skeleton when loading', () => {
    render(<KPICards summary={mockSummary} loading={true} />);
    
    const skeletons = screen.getAllByRole('status', { hidden: true });
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
```

**Integration Test: Transaction Creation**
```typescript
// app/api/transactions/__tests__/route.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'test-transaction-id',
              value: 100,
              description: 'Test transaction',
              category: 'Outros',
              type: 'receita',
              investment_type: 'N/A',
              timestamp: new Date().toISOString(),
              user_id: 'test-user-id',
            },
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

describe('POST /api/transactions', () => {
  it('should create a transaction with valid payload', async () => {
    const request = new NextRequest('http://localhost/api/transactions', {
      method: 'POST',
      body: JSON.stringify({
        value: 100,
        description: 'Test transaction',
        type: 'receita',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data).toHaveProperty('id');
    expect(data.data.value).toBe(100);
  });

  it('should return 400 for invalid payload', async () => {
    const request = new NextRequest('http://localhost/api/transactions', {
      method: 'POST',
      body: JSON.stringify({
        value: -100, // Invalid: negative value
        description: 'Test',
        type: 'receita',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```


### Test Coverage Goals

- **Unit Tests**: >= 80% coverage for utility functions and business logic
- **Component Tests**: All major components should have basic rendering tests
- **Integration Tests**: All API routes should have happy path and error case tests
- **Critical Paths**: Authentication, transaction creation, and deletion flows must be tested

### Test Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
```


## Security Considerations

### Authentication Security

**1. JWT Token Handling**
- Store JWT tokens in httpOnly cookies (not localStorage)
- Set secure flag for production (HTTPS only)
- Implement SameSite=Strict to prevent CSRF
- Token expiration: 1 hour (Supabase default)
- Refresh token rotation enabled

**2. Password Security**
- Minimum 8 characters
- Require uppercase, lowercase, and number
- Supabase handles hashing (bcrypt)
- No password validation on client (avoid leaking requirements to attackers)

**3. Rate Limiting**
- Login attempts: 5 per 15 minutes per IP
- Registration: 3 per hour per IP
- Use Upstash Redis for distributed rate limiting
- Return 429 status code when limit exceeded

**4. User Enumeration Prevention**
- Generic error messages for login failures
- Same response time for existing vs non-existing users
- No "email already registered" messages during login

### Data Security

**1. Row Level Security (RLS)**
- Enforce user_id checks at database level
- Users can only access their own transactions
- RLS policies prevent horizontal privilege escalation
- No need for application-level user_id filtering (defense in depth)

**2. Input Validation**
- Validate all inputs with Zod schemas
- Sanitize description field (no HTML/scripts)
- UUID validation for transaction IDs
- Date range validation (start <= end)

**3. SQL Injection Prevention**
- Use Supabase client methods (parameterized queries)
- Never construct SQL strings manually
- All queries go through ORM layer

**4. XSS Prevention**
- React automatically escapes JSX content
- Never use dangerouslySetInnerHTML
- Sanitize any user-generated content before rendering

### API Security

**1. CORS Configuration**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || 'https://fluxcash.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

**2. Environment Variables**
- Never commit `.env.local` to git
- Use Vercel environment variables for production
- Separate keys for development and production
- Never expose SUPABASE_SERVICE_ROLE_KEY to frontend

**3. Request Size Limits**
- Limit request body size to 1MB
- Prevent DoS via large payloads
- Use Next.js built-in body parser limits


### Logging and Monitoring

**1. Error Logging**
- Log all 5xx errors to console (captured by Vercel)
- Include timestamp, endpoint, user_id (masked), error type
- Never log sensitive data (passwords, tokens, full emails)
- Mask email addresses: `jo**@example.com`

**2. Security Event Logging**
- Failed login attempts
- Rate limit violations
- Unauthorized access attempts (403)
- Transaction deletions (audit trail)

**3. Performance Monitoring**
- Monitor API response times
- Track database query performance
- Set up alerts for high error rates
- Use Vercel Analytics for frontend metrics


## Performance Optimization

### Frontend Optimization

**1. Code Splitting**
```typescript
// Lazy load chart components (only on Dashboard page)
const IncomeExpenseBarChart = dynamic(
  () => import('@/components/dashboard/IncomeExpenseBarChart'),
  { loading: () => <LoadingSpinner /> }
);

const ExpenseDonutChart = dynamic(
  () => import('@/components/dashboard/ExpenseDonutChart'),
  { loading: () => <LoadingSpinner /> }
);
```

**2. React Query Caching**
```typescript
// hooks/useTransactions.ts
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => TransactionService.getTransactions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
```

**3. Memoization**
```typescript
// components/dashboard/IncomeExpenseBarChart.tsx
import { useMemo } from 'react';

export function IncomeExpenseBarChart({ transactions, groupBy }: Props) {
  const chartData = useMemo(() => {
    // Expensive aggregation logic
    return processTransactionsByPeriod(transactions, groupBy);
  }, [transactions, groupBy]);

  return <BarChart data={chartData} />;
}
```

**4. Image Optimization**
- Use Next.js Image component for all images
- Serve images in WebP format
- Lazy load images below the fold

**5. Bundle Size Optimization**
- Tree-shake unused code
- Use dynamic imports for heavy libraries (Recharts)
- Analyze bundle with `@next/bundle-analyzer`
- Target bundle size: < 200KB initial load


### Backend Optimization

**1. Database Indexing**
- Already exists on `user_id`, `timestamp`, `type`
- Ensure indexes are used in queries
- Monitor slow queries via Supabase dashboard

**2. API Response Caching**
```typescript
// app/api/summary/route.ts
export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  // Response cached by Next.js
  const summary = await SummaryService.getSummary(filters);
  return NextResponse.json({ data: summary });
}
```

**3. Query Optimization**
- Limit results to 500 transactions
- Use pagination for large datasets (future enhancement)
- Select only required fields (avoid `SELECT *` if possible)
- Aggregate on database side (SUM, COUNT)

**4. Serverless Function Optimization**
- Keep cold start time < 500ms
- Minimize bundle size for API routes
- Reuse Supabase client instances
- Use edge runtime where possible

### Monitoring Targets

**Lighthouse Metrics:**
- Performance: >= 85
- Accessibility: >= 90
- Best Practices: >= 90
- SEO: >= 85

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**API Response Times:**
- GET /api/transactions: < 500ms
- POST /api/transactions: < 300ms
- GET /api/summary: < 600ms


## Deployment Strategy

### Vercel Configuration

**1. Environment Variables**
```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
ALLOWED_ORIGIN=https://fluxcash.vercel.app
```

**2. Build Configuration**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optimize for serverless
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Images configuration
  images: {
    domains: [],
    formats: ['image/webp'],
  },
};

module.exports = nextConfig;
```

**3. Deployment Steps**
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set production branch to `main`
4. Enable automatic deployments on push
5. Configure preview deployments for pull requests
6. Set up custom domain (optional)

**4. Build Command**
```bash
npm run build
```

**5. Start Command**
```bash
npm run start
```

### CI/CD Pipeline

**GitHub Actions Workflow (Optional)**
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Build
        run: npm run build
```


### Rollback Strategy

**1. Version Pinning**
- Pin all dependencies to specific versions in `package.json`
- Use `package-lock.json` for deterministic builds
- Tag releases in Git for easy rollback

**2. Vercel Rollback**
- Vercel keeps deployment history
- One-click rollback to previous deployment
- Preview deployments for testing before production

**3. Database Migrations**
- No schema changes in this migration
- If future migrations needed: use Supabase migrations
- Always test migrations on staging first


## Migration Approach

### Phase 1: Project Setup
1. Initialize Next.js 14+ project with TypeScript
2. Install core dependencies (React, Supabase client, Recharts, styled-components)
3. Set up ESLint and Prettier
4. Configure environment variables
5. Set up project directory structure
6. Configure Supabase client for browser and server

### Phase 2: Authentication Implementation
1. Create AuthContext and useAuth hook
2. Build Login and Register pages
3. Implement authentication API routes
4. Create AuthGuard component
5. Set up rate limiting for auth endpoints
6. Test authentication flow end-to-end

### Phase 3: Core Services and Utilities
1. Implement CategoryEngine with keyword matching
2. Create Zod validation schemas
3. Build TransactionService with CRUD methods
4. Create SummaryService for dashboard aggregation
5. Implement formatters and date helpers
6. Write unit tests for services

### Phase 4: UI Components and Theme
1. Define theme configuration (colors, spacing, typography)
2. Create base UI components (Button, Input, Card, Select)
3. Build layout components (Header, Sidebar, MainLayout)
4. Implement LoadingSpinner and error states
5. Create Toast notification system

### Phase 5: Transaction Management
1. Build TransactionForm with validation
2. Create TransactionTable with formatting
3. Implement TransactionFilters
4. Build DeleteTransactionForm
5. Create transaction API routes (GET, POST, DELETE)
6. Integrate with frontend using React Query
7. Test transaction creation and deletion flows


### Phase 6: Dashboard Implementation
1. Create KPICards component with summary metrics
2. Build IncomeExpenseBarChart with Recharts
3. Create ExpenseDonutChart with category breakdown
4. Implement BalanceTrendChart with cumulative calculation
5. Build InvestmentTimelineChart with marker differentiation
6. Create summary API route
7. Integrate dashboard page with data fetching
8. Add loading states and empty states
9. Test all charts with various data scenarios

### Phase 7: Responsive Design and Polish
1. Ensure mobile responsiveness for all pages
2. Test on tablet and desktop viewports
3. Optimize chart rendering for mobile
4. Add loading skeletons
5. Implement error boundaries
6. Polish animations and transitions
7. Test dark/neon theme consistency

### Phase 8: Testing and Quality Assurance
1. Write unit tests for CategoryEngine
2. Write component tests for forms and charts
3. Write integration tests for API routes
4. Test authentication flows (login, register, logout)
5. Test transaction CRUD operations
6. Test filtering and date range functionality
7. Run Lighthouse audits
8. Fix performance issues

### Phase 9: Deployment Preparation
1. Set up Vercel project
2. Configure environment variables
3. Test build process locally
4. Create deployment documentation
5. Set up custom domain (if applicable)
6. Configure CORS for production
7. Test preview deployment

### Phase 10: Production Deployment and Monitoring
1. Deploy to Vercel production
2. Verify all functionality in production
3. Monitor error logs
4. Track performance metrics
5. Collect user feedback
6. Address any production issues


## Risk Assessment and Mitigation

### Technical Risks

**Risk 1: Supabase Client Compatibility**
- **Risk**: Differences between Python and JavaScript Supabase clients
- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**: Use official @supabase/supabase-js library; test all database operations early

**Risk 2: Chart Library Performance**
- **Risk**: Recharts may be slow with large datasets
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Implement data aggregation on backend; limit chart data to 500 points; use memoization

**Risk 3: Authentication Token Management**
- **Risk**: JWT token expiration causing poor UX
- **Likelihood**: Medium
- **Impact**: Low
- **Mitigation**: Implement automatic token refresh; clear error messages; graceful logout

**Risk 4: Vercel Serverless Function Cold Starts**
- **Risk**: Slow initial API responses
- **Likelihood**: High
- **Impact**: Low
- **Mitigation**: Use edge runtime where possible; implement proper loading states; warm functions with periodic health checks

### Business Risks

**Risk 5: Feature Parity Gaps**
- **Risk**: Missing features from Streamlit version
- **Likelihood**: Low
- **Impact**: High
- **Mitigation**: Comprehensive requirements review; feature checklist; user acceptance testing

**Risk 6: Data Loss During Migration**
- **Risk**: Accidental data deletion or corruption
- **Likelihood**: Very Low
- **Impact**: Critical
- **Mitigation**: No database changes required; read-only migration testing; database backup before go-live

### Mitigation Summary

All identified risks have clear mitigation strategies. The most critical risk (data loss) has very low likelihood due to the migration approach of reusing the existing database without schema changes.


## Acceptance Criteria Summary

This design document addresses all requirements from the requirements document:

✅ **Requirement 1**: Frontend architecture with React 18+, functional components, hooks, routing, responsive design, dark/neon theme  
✅ **Requirement 2**: Backend with Node.js/Next.js, RESTful API, validation, Supabase connection, error handling  
✅ **Requirement 3**: Authentication with Supabase Auth, JWT tokens, rate limiting, password validation  
✅ **Requirement 4**: Transaction data model with validation, UUID generation, timestamp handling  
✅ **Requirement 5**: Automatic categorization with CategoryEngine keyword matching  
✅ **Requirement 6**: Joint transaction detection with #conjunto regex  
✅ **Requirement 7**: Transaction CRUD operations with validation and RLS enforcement  
✅ **Requirement 8**: Transaction filtering by date range and type  
✅ **Requirement 9**: Dashboard KPI display with 4 metrics and formatting  
✅ **Requirement 10**: Income vs Expense bar chart with Recharts  
✅ **Requirement 11**: Expense donut chart by category  
✅ **Requirement 12**: Balance trend area chart with cumulative calculation  
✅ **Requirement 13**: Investment timeline chart with marker differentiation  
✅ **Requirement 14**: Transaction table with formatting and responsive design  
✅ **Requirement 15**: Transaction creation form with validation  
✅ **Requirement 16**: Transaction deletion UI with confirmation  
✅ **Requirement 17**: Supabase integration with RLS and existing schema  
✅ **Requirement 18**: Vercel deployment configuration with environment variables  
✅ **Requirement 19**: Error handling with loading states and user feedback  
✅ **Requirement 20**: Code quality setup with ESLint, Prettier, Jest, and Testing Library  

All 20 requirements are fully addressed in this design document.


## Appendix

### Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "recharts": "^2.10.0",
    "styled-components": "^6.1.0",
    "zod": "^3.22.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.48.0",
    "date-fns": "^2.30.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.10.0",
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.1.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0"
  }
}
```

### Glossary Reference

- **FluxCash_System**: Complete React-based personal finance application
- **Frontend**: Next.js React application with SSR and client-side routing
- **Backend**: Next.js API Routes running as Vercel serverless functions
- **Database**: Unchanged Supabase PostgreSQL with existing transactions table
- **Auth_Service**: Supabase Authentication integrated via SDK
- **Transaction**: Financial record with automatic categorization
- **Category_Engine**: JavaScript implementation of keyword-based categorization
- **Investment_Type**: Individual, Conjunto, or N/A classification
- **Dashboard**: Main page with 4 KPIs and 4 charts
- **KPI**: Total income, total expense, balance, total investments
- **Joint_Transaction**: Transaction tagged with #conjunto for shared expenses
- **Transaction_Processor**: CategoryEngine.processTransaction() method
- **User**: Authenticated account via Supabase Auth
- **Rate_Limiter**: Redis-based rate limiting for authentication endpoints

