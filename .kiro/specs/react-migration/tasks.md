# Implementation Plan: FluxCash React Migration

## Overview

This implementation plan converts the FluxCash personal finance application from Python/Streamlit to React/Next.js with TypeScript. The migration maintains all existing functionality while modernizing the tech stack with Next.js 14+ App Router, React 18+, Supabase backend, and TypeScript for type safety. The implementation follows an incremental approach, building foundational infrastructure first, then core features, and finally integration and deployment configuration.

## Tasks

- [ ] 1. Initialize Next.js project and configure development environment
  - Create new Next.js 14+ project with TypeScript and App Router
  - Install core dependencies: React 18+, Next.js, TypeScript, Supabase client, Zod, Recharts, styled-components
  - Configure tsconfig.json with strict type checking and path aliases
  - Set up .env.local with SUPABASE_URL and SUPABASE_ANON_KEY
  - Create .env.example file documenting required environment variables
  - Configure ESLint with Airbnb or Standard config and Prettier
  - Set up .gitignore excluding node_modules, .env.local, .next, and build artifacts
  - _Requirements: 1.1, 1.6, 2.7, 17.2, 17.3, 20.1, 20.2, 20.3, 20.5, 20.6_

- [ ] 2. Set up project structure and core type definitions
  - Create directory structure following Next.js App Router conventions (app/, components/, lib/, types/, hooks/, contexts/)
  - Define core TypeScript types in types/transaction.ts (Transaction, TransactionCreate, TransactionType, InvestmentType, Category)
  - Define summary types in types/summary.ts (DashboardSummary)
  - Define API response types in types/api.ts (ApiResponse, TransactionFilters)
  - Create theme configuration in styles/theme.ts with dark/neon color palette
  - Create global styles in styles/globalStyles.ts
  - _Requirements: 1.5, 4.1_

- [ ] 3. Implement Supabase client and authentication service
  - [ ] 3.1 Create Supabase client for browser in lib/supabase/client.ts
    - Initialize Supabase client with environment variables
    - Export singleton instance for client-side usage
    - _Requirements: 17.1, 17.2_
  
  - [ ] 3.2 Create Supabase client for server in lib/supabase/server.ts
    - Initialize Supabase client for server-side rendering and API routes
    - Handle cookies for authentication state
    - _Requirements: 17.1, 17.4_
  
  - [ ] 3.3 Implement AuthService in lib/services/authService.ts
    - Write login() method with email/password authentication
    - Write register() method with password strength validation
    - Write logout() method to invalidate sessions
    - Write getCurrentUser() method to retrieve authenticated user
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.8, 3.9_
  
  - [ ]* 3.4 Write unit tests for AuthService
    - Test login success and failure scenarios
    - Test registration with valid and invalid passwords
    - Test logout functionality
    - Test getCurrentUser with valid and expired tokens
    - _Requirements: 3.1, 3.2, 3.5, 3.8_

- [ ] 4. Build authentication UI components and context
  - [ ] 4.1 Create AuthContext in contexts/AuthContext.tsx
    - Implement context provider with user state and authentication methods
    - Provide login, register, logout, and user state to child components
    - Handle loading states during authentication checks
    - _Requirements: 1.2, 3.6, 3.7_
  
  - [ ] 4.2 Create AuthGuard component in components/auth/AuthGuard.tsx
    - Check authentication status from AuthContext
    - Redirect unauthenticated users to /login
    - Display loading spinner during authentication check
    - _Requirements: 3.7_
  
  - [ ] 4.3 Implement LoginForm component in components/auth/LoginForm.tsx
    - Create form with email and password fields using React Hook Form
    - Validate email format and password length client-side
    - Submit credentials to /api/auth/login endpoint
    - Display error messages and loading states
    - Store JWT token on successful login
    - _Requirements: 3.1, 3.2, 3.3, 3.6_
  
  - [ ] 4.4 Implement RegisterForm component in components/auth/RegisterForm.tsx
    - Create form with email, password, and confirm password fields
    - Validate password strength (8+ chars, uppercase, lowercase, number)
    - Ensure password and confirm password match
    - Submit to /api/auth/register endpoint
    - Display validation errors and success messages
    - _Requirements: 3.5_
  
  - [ ]* 4.5 Write unit tests for authentication components
    - Test LoginForm validation and submission
    - Test RegisterForm password strength validation
    - Test AuthGuard redirect behavior
    - Test AuthContext state management
    - _Requirements: 3.1, 3.2, 3.5, 3.7_

- [ ] 5. Create authentication API routes
  - [ ] 5.1 Implement POST /api/auth/login route in app/api/auth/login/route.ts
    - Validate request body with Zod schema (LoginSchema)
    - Call AuthService.login() with credentials
    - Implement rate limiting (5 attempts per 15 minutes)
    - Set httpOnly cookie with JWT token
    - Return user data and token on success
    - Return generic error message on failure (prevent user enumeration)
    - _Requirements: 2.2, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 5.2 Implement POST /api/auth/register route in app/api/auth/register/route.ts
    - Validate request body with Zod schema (RegisterSchema)
    - Call AuthService.register() with email and password
    - Return user data and token on success
    - Return validation errors for weak passwords
    - Return 409 status code for duplicate email
    - _Requirements: 2.2, 2.4, 2.5, 3.5_
  
  - [ ] 5.3 Implement POST /api/auth/logout route in app/api/auth/logout/route.ts
    - Call AuthService.logout() to invalidate session
    - Clear authentication cookies
    - Return success message
    - _Requirements: 3.8_
  
  - [ ]* 5.4 Write integration tests for authentication API routes
    - Test login endpoint with valid and invalid credentials
    - Test register endpoint with strong and weak passwords
    - Test logout endpoint
    - Test rate limiting on login endpoint
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.8_

- [ ] 6. Implement category engine and transaction processing logic
  - [ ] 6.1 Create CategoryEngine in lib/services/categoryEngine.ts
    - Implement suggestCategory() method with keyword matching algorithm
    - Define CATEGORY_KEYWORDS mapping with all categories and keywords
    - Implement normalizeText() helper to remove accents and lowercase text
    - Implement isJointTransaction() method to detect #conjunto tag
    - Implement detectInvestmentType() method based on #conjunto presence
    - Implement processTransaction() method to enrich transaction data
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 6.2 Write unit tests for CategoryEngine
    - Test suggestCategory() with various descriptions for all categories
    - Test normalizeText() with accented characters
    - Test isJointTransaction() with and without #conjunto tag
    - Test detectInvestmentType() for Individual and Conjunto scenarios
    - Test processTransaction() end-to-end enrichment
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2_

- [ ] 7. Build transaction service and validation schemas
  - [ ] 7.1 Create Zod validation schemas in lib/validation/schemas.ts
    - Define TransactionCreateSchema with all field validations
    - Define LoginSchema and RegisterSchema for authentication
    - Define TransactionFiltersSchema for query parameters
    - Define UUIDSchema for ID validation
    - _Requirements: 2.5, 4.1, 4.2_
  
  - [ ] 7.2 Implement TransactionService in lib/services/transactionService.ts
    - Write getTransactions() method with filter support
    - Write createTransaction() method with validation and enrichment
    - Write deleteTransaction() method with UUID validation
    - Use Supabase client for all database operations
    - Ensure RLS policies are respected by passing authenticated user context
    - _Requirements: 2.2, 2.3, 2.6, 4.2, 4.3, 4.4, 7.1, 7.2, 7.3, 7.4, 7.6, 7.7, 7.8_
  
  - [ ]* 7.3 Write unit tests for TransactionService
    - Test getTransactions() with various filter combinations
    - Test createTransaction() with valid and invalid payloads
    - Test deleteTransaction() with valid and invalid UUIDs
    - Mock Supabase client responses
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 7.7, 7.8_

- [ ] 8. Create transaction API routes
  - [ ] 8.1 Implement GET /api/transactions route in app/api/transactions/route.ts
    - Extract and validate query parameters using TransactionFiltersSchema
    - Extract user_id from JWT token using authentication middleware
    - Call TransactionService.getTransactions() with filters
    - Order results by timestamp DESC
    - Limit results to 500 transactions
    - Return transaction array
    - Handle errors with appropriate HTTP status codes
    - _Requirements: 2.2, 2.4, 7.2, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_
  
  - [ ] 8.2 Implement POST /api/transactions route in app/api/transactions/route.ts
    - Validate request body with TransactionCreateSchema
    - Extract user_id from JWT token
    - Run CategoryEngine.processTransaction() to enrich data
    - Generate server-side UUID and timestamp
    - Call TransactionService.createTransaction()
    - Return created transaction with 201 status code
    - Handle validation errors with 400 status code
    - _Requirements: 2.2, 2.4, 2.5, 4.2, 4.3, 7.1, 7.4_
  
  - [ ] 8.3 Implement DELETE /api/transactions/[id] route in app/api/transactions/[id]/route.ts
    - Extract and validate transaction ID using UUIDSchema
    - Extract user_id from JWT token
    - Call TransactionService.deleteTransaction()
    - Return 200 status code with success message
    - Return 400 for invalid UUID format
    - Return 403 when user attempts to delete another user's transaction
    - Return 404 when transaction is not found
    - _Requirements: 7.3, 7.6, 7.7, 7.8_
  
  - [ ]* 8.4 Write integration tests for transaction API routes
    - Test GET /api/transactions with various filters
    - Test POST /api/transactions with valid and invalid payloads
    - Test DELETE /api/transactions/[id] with valid and invalid IDs
    - Test RLS enforcement (users can only access own transactions)
    - Test error handling for unauthorized requests
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 7.7, 7.8_

- [ ] 9. Checkpoint - Ensure API and authentication tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement summary service and API endpoint
  - [ ] 10.1 Create SummaryService in lib/services/summaryService.ts
    - Write getSummary() method to calculate dashboard metrics
    - Calculate total_income (sum of receitas)
    - Calculate total_expense (sum of despesas)
    - Calculate balance (income - expense)
    - Calculate total_investment (sum where investment_type is Individual or Conjunto)
    - Aggregate expense_by_category and income_by_category
    - Apply date range filters
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 10.2 Implement GET /api/summary route in app/api/summary/route.ts
    - Extract and validate query parameters (start_date, end_date)
    - Extract user_id from JWT token
    - Call SummaryService.getSummary() with filters
    - Return DashboardSummary object
    - Handle errors with appropriate status codes
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.9_
  
  - [ ]* 10.3 Write unit tests for SummaryService
    - Test getSummary() with various transaction datasets
    - Test date range filtering
    - Test category aggregation
    - Test investment type filtering
    - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [ ] 11. Build UI component library (buttons, inputs, cards)
  - [ ] 11.1 Create Button component in components/ui/Button.tsx
    - Implement styled button with primary, secondary, and danger variants
    - Support loading state with spinner
    - Support disabled state
    - Apply dark/neon theme colors
    - _Requirements: 1.5_
  
  - [ ] 11.2 Create Input component in components/ui/Input.tsx
    - Implement styled text input with label and error message support
    - Support different input types (text, email, password, number, date)
    - Apply dark/neon theme colors
    - Display validation errors with red border
    - _Requirements: 1.5, 19.3_
  
  - [ ] 11.3 Create Select component in components/ui/Select.tsx
    - Implement styled dropdown with label support
    - Support option groups
    - Apply dark/neon theme colors
    - _Requirements: 1.5_
  
  - [ ] 11.4 Create Card component in components/ui/Card.tsx
    - Implement styled container with border and shadow
    - Support header and footer slots
    - Apply dark/neon theme colors
    - _Requirements: 1.5_
  
  - [ ] 11.5 Create LoadingSpinner component in components/ui/LoadingSpinner.tsx
    - Implement animated spinner with configurable size
    - Support fullscreen overlay variant
    - _Requirements: 19.1_
  
  - [ ] 11.6 Create Toast notification system in components/ui/Toast.tsx and contexts/ToastContext.tsx
    - Implement toast container with success, error, and info variants
    - Auto-dismiss after 3 seconds for success messages
    - Provide useToast hook for triggering notifications
    - _Requirements: 19.7, 19.8_

- [ ] 12. Implement dashboard KPI cards component
  - [ ] 12.1 Create KPICards component in components/dashboard/KPICards.tsx
    - Render 4 KPI cards in responsive grid layout
    - Display Total Receitas, Total Despesas, Saldo, Total Investimentos
    - Format values as Brazilian Real (R$ X.XXX,XX) using formatters utility
    - Apply color coding: green for income, red for expense, yellow for investments, blue for balance
    - Display appropriate icons for each metric (💰, 💸, ⚖️, 📈)
    - Show loading skeleton while data loads
    - _Requirements: 1.4, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_
  
  - [ ]* 12.2 Write unit tests for KPICards component
    - Test rendering of all 4 cards
    - Test currency formatting
    - Test color coding
    - Test loading state
    - _Requirements: 9.1, 9.6, 9.7, 9.8_

- [ ] 13. Build data visualization chart components
  - [ ] 13.1 Create utility functions in lib/utils/formatters.ts
    - Implement formatCurrency() for Brazilian Real formatting
    - Implement formatDate() for DD/MM/YYYY format
    - Implement formatDateTime() for DD/MM/YYYY HH:MM format
    - _Requirements: 4.5, 9.6, 14.2, 14.3_
  
  - [ ] 13.2 Create IncomeExpenseBarChart component in components/dashboard/IncomeExpenseBarChart.tsx
    - Group transactions by month using date aggregation logic
    - Calculate total income and expense per period
    - Render grouped bar chart using Recharts library
    - Use green bars for income, red bars for expense
    - Format Y-axis as Brazilian Real
    - Display hover tooltips with exact values
    - Show "Sem dados para o período" message when empty
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_
  
  - [ ] 13.3 Create ExpenseDonutChart component in components/dashboard/ExpenseDonutChart.tsx
    - Filter transactions where type = 'despesa'
    - Aggregate expenses by category
    - Render donut chart (55% inner radius) using Recharts
    - Display category name, value, and percentage in tooltips
    - Use distinct colors for each category
    - Show "Sem despesas no período" message when empty
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
  
  - [ ] 13.4 Create BalanceTrendChart component in components/dashboard/BalanceTrendChart.tsx
    - Sort transactions chronologically
    - Calculate cumulative balance (income positive, expense negative)
    - Render area chart using Recharts
    - Fill area with semi-transparent green (#4ade8026)
    - Draw line in solid primary green (#4ade80)
    - Format X-axis as DD/MM/YYYY
    - Display tooltips with date and balance value
    - Show "Sem dados para o período" message when empty
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  
  - [ ] 13.5 Create InvestmentTimelineChart component in components/dashboard/InvestmentTimelineChart.tsx
    - Filter transactions where investment_type is 'Individual' OR 'Conjunto'
    - Sort transactions chronologically
    - Render line chart with markers using Recharts
    - Use yellow color (#fbbf24) for line
    - Differentiate Individual (circle markers) vs Conjunto (diamond markers)
    - Display tooltips with date, value, and investment type
    - Show "Sem investimentos no período" message when empty
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  
  - [ ]* 13.6 Write unit tests for chart components
    - Test IncomeExpenseBarChart data aggregation and rendering
    - Test ExpenseDonutChart filtering and category aggregation
    - Test BalanceTrendChart cumulative balance calculation
    - Test InvestmentTimelineChart filtering and marker differentiation
    - Test empty state messages for all charts
    - _Requirements: 10.1, 11.1, 12.1, 13.1_

- [ ] 14. Create transaction table and filtering components
  - [ ] 14.1 Create TransactionTable component in components/transactions/TransactionTable.tsx
    - Render responsive table with columns: ID, Data, Descrição, Categoria, Tipo, Valor (R$), Investimento
    - Format Data column as DD/MM/YYYY HH:MM using formatDateTime()
    - Format Valor column with R$ prefix and 2 decimal places using formatCurrency()
    - Apply color coding to Tipo (green for receita, red for despesa)
    - Display joint transaction badge for Conjunto investments
    - Make table horizontally scrollable on small screens
    - Display "Nenhuma transação encontrada" message when empty
    - Include summary row with sum of receitas, sum of despesas, and saldo
    - _Requirements: 1.4, 4.5, 6.6, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_
  
  - [ ] 14.2 Create TransactionFilters component in components/transactions/TransactionFilters.tsx
    - Render filter controls: start_date, end_date, type (all/receita/despesa)
    - Validate start_date <= end_date client-side
    - Emit onChange event when filters change
    - Provide "Clear filters" button
    - Display active filter count badge
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 14.3 Write unit tests for transaction display components
    - Test TransactionTable rendering and formatting
    - Test TransactionFilters validation and events
    - Test empty state handling
    - Test summary calculations
    - _Requirements: 8.1, 14.1, 14.2, 14.3, 14.5, 14.7_

- [ ] 15. Build transaction creation and deletion forms
  - [ ] 15.1 Create TransactionForm component in components/transactions/TransactionForm.tsx
    - Render form with fields: valor, descrição, categoria, tipo, investment_type
    - Validate valor > 0 client-side using React Hook Form
    - Validate descrição length (1-200 chars)
    - Populate categoria dropdown with all categories
    - Default investment_type to "N/A"
    - Display hint when #conjunto detected in descrição
    - Submit to POST /api/transactions
    - Clear form on success
    - Display toast notification on success/error
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9_
  
  - [ ] 15.2 Create DeleteTransactionForm component in components/transactions/DeleteTransactionForm.tsx
    - Render expandable section for deletion
    - Accept transaction ID input field
    - Validate UUID format using Zod
    - Require confirmation checkbox labeled "Confirmar exclusão"
    - Display warning "⚠️ A transação será removida permanentemente" when checkbox checked
    - Send DELETE /api/transactions/:id
    - Display success toast and trigger refresh
    - Display validation error "❌ ID inválido. Use o formato UUID exibido na tabela" for invalid UUID
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8_
  
  - [ ]* 15.3 Write unit tests for transaction forms
    - Test TransactionForm validation and submission
    - Test #conjunto hint display
    - Test DeleteTransactionForm UUID validation
    - Test confirmation checkbox requirement
    - _Requirements: 15.2, 15.3, 15.9, 16.3, 16.4, 16.8_

- [ ] 16. Create layout components (Header, Sidebar, MainLayout)
  - [ ] 16.1 Create Header component in components/layout/Header.tsx
    - Display FluxCash logo and title
    - Show user avatar and email from AuthContext
    - Provide logout button
    - Implement responsive navigation menu
    - _Requirements: 1.4_
  
  - [ ] 16.2 Create Sidebar component in components/layout/Sidebar.tsx
    - Render navigation links (Dashboard, Transactions)
    - Highlight active route using Next.js usePathname hook
    - Collapse on mobile devices
    - Display user info at top
    - _Requirements: 1.3, 1.4_
  
  - [ ] 16.3 Create MainLayout component in components/layout/MainLayout.tsx
    - Compose Header, Sidebar, and main content area
    - Apply consistent spacing and layout structure
    - Wrap with AuthGuard for protected routes
    - _Requirements: 1.4_

- [ ] 17. Implement custom hooks for data fetching
  - [ ] 17.1 Create useAuth hook in hooks/useAuth.ts
    - Access AuthContext and return user, login, register, logout methods
    - Provide loading and error states
    - _Requirements: 1.2_
  
  - [ ] 17.2 Create useTransactions hook in hooks/useTransactions.ts
    - Fetch transactions from GET /api/transactions with React Query
    - Accept filters as parameters
    - Provide loading, error, and data states
    - Expose refetch method for manual refresh
    - Implement cache invalidation on create/delete
    - _Requirements: 1.2, 7.2, 8.2, 8.9_
  
  - [ ] 17.3 Create useSummary hook in hooks/useSummary.ts
    - Fetch summary from GET /api/summary with React Query
    - Accept date range filters as parameters
    - Provide loading, error, and data states
    - Implement cache invalidation when transactions change
    - _Requirements: 1.2, 9.9_
  
  - [ ] 17.4 Create useToast hook in hooks/useToast.ts
    - Access ToastContext and return toast methods
    - Provide showSuccess, showError, showInfo methods
    - _Requirements: 19.7, 19.8_

- [ ] 18. Build authentication pages (login and register)
  - [ ] 18.1 Create login page in app/(auth)/login/page.tsx
    - Render LoginForm component
    - Redirect to /dashboard on successful login
    - Display FluxCash logo and branding
    - Include link to register page
    - _Requirements: 3.1, 3.2, 3.7_
  
  - [ ] 18.2 Create register page in app/(auth)/register/page.tsx
    - Render RegisterForm component
    - Redirect to /dashboard on successful registration
    - Display FluxCash logo and branding
    - Include link to login page
    - _Requirements: 3.5_
  
  - [ ] 18.3 Create auth layout in app/(auth)/layout.tsx
    - Apply centered layout for authentication pages
    - Apply dark/neon theme styling
    - _Requirements: 1.5_

- [ ] 19. Build dashboard page with all visualizations
  - [ ] 19.1 Create dashboard page in app/dashboard/page.tsx
    - Wrap with AuthGuard to protect route
    - Fetch summary data using useSummary hook
    - Fetch transactions using useTransactions hook
    - Render KPICards component with summary data
    - Render IncomeExpenseBarChart with transactions
    - Render ExpenseDonutChart with transactions
    - Render BalanceTrendChart with transactions
    - Render InvestmentTimelineChart with transactions
    - Display loading state while data fetches
    - Handle errors with error messages
    - Respect date range filters when calculating KPIs
    - _Requirements: 1.2, 3.7, 9.1, 9.9, 10.1, 11.1, 12.1, 13.1, 19.1, 19.2_
  
  - [ ]* 19.2 Write integration tests for dashboard page
    - Test data fetching and rendering
    - Test loading states
    - Test error handling
    - Test filter application
    - _Requirements: 9.9, 19.1, 19.2_

- [ ] 20. Build transactions page with table and forms
  - [ ] 20.1 Create transactions page in app/transactions/page.tsx
    - Wrap with AuthGuard to protect route
    - Fetch transactions using useTransactions hook with filters
    - Render TransactionFilters component
    - Render TransactionTable component
    - Render TransactionForm component
    - Render DeleteTransactionForm component in expandable section
    - Handle filter changes and refetch data
    - Display loading state while data fetches
    - Handle errors with error messages
    - _Requirements: 1.2, 3.7, 7.2, 8.1, 8.9, 14.1, 15.1, 16.1, 19.1, 19.2_
  
  - [ ]* 20.2 Write integration tests for transactions page
    - Test transaction creation flow
    - Test transaction deletion flow with confirmation
    - Test filtering functionality
    - Test table rendering
    - Test error handling
    - _Requirements: 7.1, 7.3, 8.1, 14.1, 15.1, 16.1_

- [ ] 21. Checkpoint - Ensure all UI components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Create root layout and home page
  - [ ] 22.1 Create root layout in app/layout.tsx
    - Import and apply global styles
    - Wrap application with AuthContext provider
    - Wrap application with ToastContext provider
    - Configure metadata (title, description)
    - Apply dark/neon theme
    - _Requirements: 1.5_
  
  - [ ] 22.2 Create home page in app/page.tsx
    - Redirect authenticated users to /dashboard
    - Redirect unauthenticated users to /login
    - Display loading state during authentication check
    - _Requirements: 3.7_

- [ ] 23. Implement error handling and user feedback across the application
  - [ ] 23.1 Create global error boundary in app/error.tsx
    - Catch runtime errors
    - Display user-friendly error message
    - Provide retry button
    - Log errors for debugging
    - _Requirements: 19.2, 19.6_
  
  - [ ] 23.2 Create 404 page in app/not-found.tsx
    - Display "Recurso não encontrado" message
    - Provide navigation links to dashboard and home
    - _Requirements: 19.5_
  
  - [ ] 23.3 Enhance API routes with consistent error handling
    - Return 500 status code with "Erro no servidor. Tente novamente." for unexpected errors
    - Return 401 status code with "Unauthorized" for authentication failures
    - Log errors server-side for debugging
    - _Requirements: 19.4, 19.5, 19.6_

- [ ] 24. Configure deployment settings for Vercel
  - [ ] 24.1 Create next.config.js with production optimizations
    - Configure output for serverless deployment
    - Enable React strict mode
    - Configure image optimization domains if needed
    - _Requirements: 1.7, 18.1, 18.4_
  
  - [ ] 24.2 Create vercel.json configuration file
    - Configure CORS headers for production domain
    - Set up redirects if needed
    - Configure serverless function settings
    - _Requirements: 2.8, 18.1, 18.5, 18.7_
  
  - [ ] 24.3 Update README.md with deployment instructions
    - Document required environment variables
    - Provide step-by-step Vercel deployment guide
    - Include local development setup instructions
    - Document npm scripts (start, build, test, lint)
    - _Requirements: 18.6, 20.4_
  
  - [ ] 24.4 Verify environment variable configuration
    - Ensure .env.example is complete and accurate
    - Document SUPABASE_URL and SUPABASE_ANON_KEY requirements
    - Add NEXT_PUBLIC_ prefix for client-side variables if needed
    - _Requirements: 17.2, 17.3, 18.3_

- [ ] 25. Performance optimization and code quality checks
  - [ ] 25.1 Implement code splitting for optimal bundle size
    - Use dynamic imports for heavy components (charts, forms)
    - Lazy load non-critical routes
    - Verify bundle size with next/bundle-analyzer
    - _Requirements: 1.7_
  
  - [ ] 25.2 Run Lighthouse performance audit
    - Test performance score on dashboard page
    - Test performance score on transactions page
    - Ensure score >= 85
    - Address performance bottlenecks if score is below target
    - _Requirements: 1.8_
  
  - [ ] 25.3 Run ESLint and Prettier on entire codebase
    - Fix all linting errors
    - Format all files with Prettier
    - Ensure consistent code style
    - _Requirements: 20.1, 20.2_
  
  - [ ] 25.4 Review CORS configuration for production
    - Ensure CORS allows requests from production domain
    - Test CORS headers in production environment
    - _Requirements: 2.8, 18.7_

- [ ] 26. Final integration testing and validation
  - [ ] 26.1 Test complete authentication flow
    - Test user registration with valid and invalid inputs
    - Test user login with correct and incorrect credentials
    - Test rate limiting on login endpoint
    - Test logout and session invalidation
    - Test protected route access control
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.8_
  
  - [ ] 26.2 Test complete transaction lifecycle
    - Create transaction with automatic categorization
    - Create joint transaction with #conjunto tag
    - Verify transaction appears in table and dashboard
    - Apply filters and verify results
    - Delete transaction with confirmation
    - Verify deletion reflects in table and dashboard
    - _Requirements: 5.1, 5.7, 6.1, 7.1, 7.3, 7.9, 8.1_
  
  - [ ] 26.3 Test dashboard visualizations with various data scenarios
    - Test dashboard with no data (empty state messages)
    - Test dashboard with mixed income/expense data
    - Test dashboard with only income data
    - Test dashboard with only expense data
    - Test dashboard with investment data
    - Test date range filtering on all charts
    - _Requirements: 9.1, 9.9, 10.5, 11.6, 12.7, 13.5_
  
  - [ ] 26.4 Test responsive design on multiple devices
    - Test layout on mobile viewport (320px-768px)
    - Test layout on tablet viewport (768px-1024px)
    - Test layout on desktop viewport (1024px+)
    - Verify horizontal scrolling on transaction table for mobile
    - Verify sidebar collapse on mobile
    - _Requirements: 1.4, 14.4_
  
  - [ ] 26.5 Verify Supabase database integration
    - Confirm connection to existing Supabase database
    - Verify Row Level Security (RLS) policies enforce user isolation
    - Test that users can only access their own transactions
    - Verify no data migration was required
    - _Requirements: 17.1, 17.3, 17.4, 17.6, 17.7_

- [ ] 27. Final checkpoint - Deployment readiness
  - Ensure all tests pass, verify deployment configuration is correct, ask the user if questions arise before deploying to production.


## Notes

- Tasks marked with `*` are optional test-related sub-tasks and can be skipped for faster MVP delivery
- Each task references specific requirements from the requirements document for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The implementation follows an incremental approach: infrastructure → authentication → core features → UI → integration → deployment
- All components use TypeScript for type safety
- All API routes use Zod for runtime validation
- The existing Supabase database schema is preserved without modifications
- Row Level Security (RLS) policies ensure user data isolation
- The dark/neon theme from the original Streamlit version is maintained throughout
- React Query is used for efficient server state management and caching
- Unit tests and integration tests validate core functionality
- Code splitting and lazy loading optimize bundle size for production
- Lighthouse performance score target is >= 85
- The application is optimized for Vercel serverless deployment

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1", "2"]
    },
    {
      "id": 1,
      "tasks": ["3.1", "3.2", "7.1", "11.1", "11.2", "11.3", "11.4", "11.5", "11.6", "13.1"]
    },
    {
      "id": 2,
      "tasks": ["3.3", "3.4", "6.1", "6.2", "7.2", "7.3"]
    },
    {
      "id": 3,
      "tasks": ["4.1", "4.2", "10.1", "10.3"]
    },
    {
      "id": 4,
      "tasks": ["4.3", "4.4", "4.5", "5.1", "5.2", "5.3", "5.4", "8.1", "8.2", "8.3", "8.4", "10.2"]
    },
    {
      "id": 5,
      "tasks": ["12.1", "12.2", "13.2", "13.3", "13.4", "13.5", "13.6", "14.1", "14.2", "14.3", "15.1", "15.2", "15.3", "16.1", "16.2", "16.3"]
    },
    {
      "id": 6,
      "tasks": ["17.1", "17.2", "17.3", "17.4", "18.1", "18.2", "18.3"]
    },
    {
      "id": 7,
      "tasks": ["19.1", "19.2", "20.1", "20.2"]
    },
    {
      "id": 8,
      "tasks": ["22.1", "22.2", "23.1", "23.2", "23.3"]
    },
    {
      "id": 9,
      "tasks": ["24.1", "24.2", "24.3", "24.4"]
    },
    {
      "id": 10,
      "tasks": ["25.1", "25.2", "25.3", "25.4"]
    },
    {
      "id": 11,
      "tasks": ["26.1", "26.2", "26.3", "26.4", "26.5"]
    }
  ]
}
```
