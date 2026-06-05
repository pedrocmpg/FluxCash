# Requirements Document

## Introduction

This document specifies the requirements for migrating the FluxCash personal finance management application from Python/Streamlit to React with JavaScript. FluxCash is a learning project for Systems Analysis and Development that focuses on investment automation and intelligent transaction categorization. The migration aims to modernize the architecture while preserving all existing functionality, maintaining the dark/neon theme, and preparing for deployment on Vercel or similar platforms.

## Glossary

- **FluxCash_System**: The complete personal finance management application
- **Frontend**: React application with functional components and hooks
- **Backend**: Node.js with Express or Next.js API Routes
- **Database**: Supabase PostgreSQL database (existing, unchanged)
- **Auth_Service**: Supabase Authentication service
- **Transaction**: Financial record with value, description, category, type (income/expense), and investment classification
- **Category_Engine**: Automatic categorization system using keyword matching
- **Investment_Type**: Classification of transactions as Individual, Conjunto (Joint/Shared), or N/A
- **Dashboard**: Main view displaying KPIs and 4 financial charts
- **KPI**: Key Performance Indicator (total income, total expense, balance, total investments)
- **Joint_Transaction**: Transaction tagged with #conjunto keyword for shared/family expenses
- **Transaction_Processor**: Logic for validating, enriching, and categorizing transactions
- **User**: Authenticated user account with email and password
- **Rate_Limiter**: Security mechanism to prevent brute force authentication attempts

## Requirements

### Requirement 1: Frontend Architecture

**User Story:** As a developer, I want a modern React-based frontend architecture, so that the application is maintainable, performant, and follows current best practices.

#### Acceptance Criteria

1. THE Frontend SHALL be built with React 18+ using functional components exclusively
2. THE Frontend SHALL use React Hooks (useState, useEffect, useContext, useMemo, useCallback) for state management
3. THE Frontend SHALL implement client-side routing using React Router v6+
4. THE Frontend SHALL be responsive and support mobile, tablet, and desktop viewports
5. THE Frontend SHALL maintain the existing dark/neon visual theme with consistent color palette
6. THE Frontend SHALL use a CSS-in-JS solution (styled-components or Emotion) OR CSS Modules for styling
7. THE Frontend SHALL implement code splitting for optimal bundle size
8. THE Frontend SHALL achieve Lighthouse performance score >= 85

### Requirement 2: Backend Architecture

**User Story:** As a developer, I want a Node.js backend with proper API structure, so that the frontend can communicate efficiently with the database.

#### Acceptance Criteria

1. THE Backend SHALL be implemented using Node.js with Express.js OR Next.js API Routes
2. THE Backend SHALL expose RESTful API endpoints for all transaction operations
3. THE Backend SHALL use async/await for all asynchronous operations
4. THE Backend SHALL implement proper error handling with meaningful HTTP status codes
5. THE Backend SHALL validate all incoming request payloads using a validation library (Zod, Joi, or Yup)
6. THE Backend SHALL connect to the existing Supabase PostgreSQL database
7. THE Backend SHALL use environment variables for all configuration (database URL, API keys)
8. THE Backend SHALL implement CORS configuration to allow frontend requests

### Requirement 3: Authentication System

**User Story:** As a user, I want to securely log in and register accounts, so that my financial data is protected.

#### Acceptance Criteria

1. THE Auth_Service SHALL use Supabase Auth for user authentication
2. WHEN a user submits valid credentials, THE Auth_Service SHALL create a session and return a JWT token
3. WHEN a user submits invalid credentials, THE Auth_Service SHALL return a generic error message to prevent user enumeration
4. THE Rate_Limiter SHALL block authentication attempts after 5 failed attempts within 15 minutes
5. WHEN a user registers, THE Auth_Service SHALL validate password strength (minimum 8 characters, uppercase, lowercase, number)
6. THE Frontend SHALL store authentication tokens securely (httpOnly cookies or secure localStorage with encryption)
7. THE Frontend SHALL redirect unauthenticated users to the login page
8. WHEN a user logs out, THE Auth_Service SHALL invalidate the session and clear client-side tokens
9. THE Auth_Service SHALL mask email addresses in logs (e.g., jo**@example.com)

### Requirement 4: Transaction Data Model

**User Story:** As a developer, I want a consistent transaction data model, so that data flows correctly between frontend, backend, and database.

#### Acceptance Criteria

1. THE Transaction SHALL contain fields: id (UUID), value (float > 0), description (string 1-200 chars), category (string), type (enum: 'receita' | 'despesa'), investment_type (enum: 'Individual' | 'Conjunto' | 'N/A'), timestamp (ISO datetime), user_id (UUID)
2. THE Backend SHALL validate that value is always positive before persisting
3. THE Backend SHALL generate UUID and timestamp server-side on transaction creation
4. THE Backend SHALL associate each Transaction with the authenticated user's user_id
5. THE Frontend SHALL display timestamps in Brazilian format (DD/MM/YYYY HH:MM)
6. THE Transaction SHALL enforce type as 'receita' (income) or 'despesa' (expense) only

### Requirement 5: Automatic Transaction Categorization

**User Story:** As a user, I want transactions to be automatically categorized based on keywords, so that I don't have to manually assign categories.

#### Acceptance Criteria

1. THE Category_Engine SHALL categorize transactions using keyword matching in the description field
2. THE Category_Engine SHALL support categories: Alimentação, Transporte, Saúde, Educação, Lazer, Moradia, Investimento, Receita, Outros
3. THE Category_Engine SHALL normalize text (remove accents, convert to lowercase) before keyword matching
4. THE Category_Engine SHALL use the following keyword mappings:
   - Alimentação: mercado, supermercado, restaurante, lanche, ifood, padaria, açougue, feira
   - Transporte: uber, 99, ônibus, metro, gasolina, combustível, estacionamento, pedágio
   - Saúde: farmácia, médico, consulta, hospital, plano de saúde, exame, dentista
   - Educação: curso, faculdade, livro, escola, mensalidade, udemy, alura, treinamento
   - Lazer: cinema, netflix, spotify, show, viagem, hotel, jogo, streaming
   - Moradia: aluguel, condomínio, água, luz, energia, internet, gás, iptu
   - Investimento: tesouro, ações, fundo, cdb, poupança, cripto, dividendo, ação
   - Receita: salário, freelance, renda, pagamento, transferência recebida, bônus
5. WHEN no keyword matches, THE Category_Engine SHALL assign category "Outros"
6. THE Category_Engine SHALL allow manual category override by the user
7. THE Category_Engine SHALL execute categorization server-side before persisting transactions

### Requirement 6: Joint Transaction Detection

**User Story:** As a user, I want to tag transactions with #conjunto to mark them as shared/joint expenses, so that I can track family or couple finances separately.

#### Acceptance Criteria

1. THE Transaction_Processor SHALL detect the #conjunto keyword (case-insensitive) in transaction descriptions using regex pattern: `/#conjunto\b/i`
2. WHEN #conjunto is detected, THE Transaction_Processor SHALL set investment_type to "Conjunto"
3. WHEN #conjunto is detected, THE Transaction_Processor SHALL set scope field to "shared"
4. WHEN #conjunto is NOT detected, THE Transaction_Processor SHALL set scope to "personal"
5. THE Transaction_Processor SHALL preserve the #conjunto tag in the description field
6. THE Frontend SHALL display joint transactions with a visual indicator (badge or icon)

### Requirement 7: Transaction CRUD Operations

**User Story:** As a user, I want to create, read, update, and delete transactions, so that I can manage my financial records.

#### Acceptance Criteria

1. THE Backend SHALL expose POST /api/transactions endpoint to create new transactions
2. THE Backend SHALL expose GET /api/transactions endpoint to retrieve transactions with optional filters
3. THE Backend SHALL expose DELETE /api/transactions/:id endpoint to remove transactions
4. WHEN creating a transaction, THE Backend SHALL run Transaction_Processor to validate, categorize, and detect joint tags
5. WHEN deleting a transaction, THE Frontend SHALL require user confirmation with a checkbox
6. THE Backend SHALL validate UUID format before processing delete requests
7. THE Backend SHALL return 404 status code when transaction ID is not found
8. THE Backend SHALL return 403 status code when user attempts to access another user's transactions
9. WHEN a transaction is created or deleted, THE Frontend SHALL refresh the transaction list and dashboard

### Requirement 8: Transaction Filtering

**User Story:** As a user, I want to filter transactions by date range and type, so that I can analyze specific periods or categories.

#### Acceptance Criteria

1. THE Frontend SHALL provide filter controls for: start date, end date, transaction type (all/receita/despesa)
2. WHEN filters are applied, THE Frontend SHALL send filter parameters as query strings to GET /api/transactions
3. THE Backend SHALL filter by start_date using >= comparison on timestamp field
4. THE Backend SHALL filter by end_date using <= comparison on timestamp field (23:59:59)
5. THE Backend SHALL filter by transaction type using exact match on type field
6. THE Backend SHALL combine multiple filters with AND logic
7. THE Backend SHALL return empty array when no transactions match filters
8. THE Backend SHALL order results by timestamp DESC (most recent first)
9. THE Backend SHALL limit results to 500 transactions per request

### Requirement 9: Dashboard KPI Display

**User Story:** As a user, I want to see key financial metrics at a glance, so that I understand my current financial status.

#### Acceptance Criteria

1. THE Dashboard SHALL display 4 KPI cards: Total Receitas, Total Despesas, Saldo, Total Investimentos
2. THE Dashboard SHALL calculate Total Receitas as sum of all transactions where type = 'receita'
3. THE Dashboard SHALL calculate Total Despesas as sum of all transactions where type = 'despesa'
4. THE Dashboard SHALL calculate Saldo as Total Receitas minus Total Despesas
5. THE Dashboard SHALL calculate Total Investimentos as sum of transactions where investment_type is 'Individual' OR 'Conjunto'
6. THE Dashboard SHALL format all monetary values in Brazilian Real (R$ X.XXX,XX)
7. THE Dashboard SHALL use color coding: green for income (#22c55e), red for expense (#f87171), yellow for investments (#fbbf24)
8. THE Dashboard SHALL display an icon for each KPI card (💰 income, 💸 expense, ⚖️ balance, 📈 investment)
9. THE Dashboard SHALL respect date range filters when calculating KPIs

### Requirement 10: Income vs Expense Bar Chart

**User Story:** As a user, I want to see a bar chart comparing income and expenses over time, so that I can identify spending patterns.

#### Acceptance Criteria

1. THE Dashboard SHALL render a grouped bar chart with income and expense bars
2. THE Dashboard SHALL group transactions by month by default
3. THE Dashboard SHALL use green bars (#22c55e) for income and red bars (#f87171) for expense
4. THE Dashboard SHALL display the chart using a JavaScript charting library (Recharts, Chart.js, or Plotly.js)
5. WHEN no transactions exist, THE Dashboard SHALL display "Sem dados para o período" message
6. THE Dashboard SHALL format x-axis with month/year labels
7. THE Dashboard SHALL format y-axis with Brazilian Real currency format
8. THE Dashboard SHALL display hover tooltips with exact values

### Requirement 11: Expense Donut Chart

**User Story:** As a user, I want to see expense distribution by category in a donut chart, so that I understand where my money goes.

#### Acceptance Criteria

1. THE Dashboard SHALL render a donut chart showing expense breakdown by category
2. THE Dashboard SHALL only include transactions where type = 'despesa'
3. THE Dashboard SHALL aggregate expenses by summing value for each category
4. THE Dashboard SHALL display percentage and absolute value in hover tooltips
5. THE Dashboard SHALL use a donut shape with 55% inner radius (hole)
6. WHEN no expenses exist, THE Dashboard SHALL display "Sem despesas no período" message
7. THE Dashboard SHALL assign distinct colors to each category automatically

### Requirement 12: Balance Trend Area Chart

**User Story:** As a user, I want to see how my balance evolves over time, so that I can track financial progress.

#### Acceptance Criteria

1. THE Dashboard SHALL render an area chart showing cumulative balance over time
2. THE Dashboard SHALL calculate cumulative balance by sorting transactions by timestamp and summing signed values (income positive, expense negative)
3. THE Dashboard SHALL fill the area with semi-transparent green (#4ade8026)
4. THE Dashboard SHALL draw the line in solid primary green (#4ade80)
5. THE Dashboard SHALL start cumulative balance at zero
6. WHEN no transactions exist, THE Dashboard SHALL display "Sem dados para o período" message
7. THE Dashboard SHALL format x-axis with date labels (DD/MM/YYYY)
8. THE Dashboard SHALL display hover tooltips with date and balance value

### Requirement 13: Investment Timeline Chart

**User Story:** As a user, I want to see a timeline of my investment contributions, so that I can monitor investment activity.

#### Acceptance Criteria

1. THE Dashboard SHALL render a line chart showing investment transactions over time
2. THE Dashboard SHALL only include transactions where investment_type is 'Individual' OR 'Conjunto'
3. THE Dashboard SHALL use yellow color (#fbbf24) for the line
4. THE Dashboard SHALL differentiate Individual (circle markers) and Conjunto (diamond markers) visually
5. WHEN no investments exist, THE Dashboard SHALL display "Sem investimentos no período" message
6. THE Dashboard SHALL sort transactions by timestamp chronologically
7. THE Dashboard SHALL display hover tooltips with date, value, and investment type

### Requirement 14: Transaction Table Display

**User Story:** As a user, I want to view all transactions in a sortable table, so that I can browse and analyze my transaction history.

#### Acceptance Criteria

1. THE Frontend SHALL render a table with columns: ID, Data, Descrição, Categoria, Tipo, Valor (R$), Investimento
2. THE Frontend SHALL format Data column as DD/MM/YYYY HH:MM
3. THE Frontend SHALL format Valor column with R$ prefix and 2 decimal places
4. THE Frontend SHALL make the table horizontally scrollable on small screens
5. THE Frontend SHALL display "Nenhuma transação encontrada" message when table is empty
6. WHEN table is empty, THE Frontend SHALL suggest adjusting filters or adding a new transaction
7. THE Frontend SHALL display quick summary metrics below table: sum of receitas, sum of despesas, saldo

### Requirement 15: Transaction Creation Form

**User Story:** As a user, I want to submit new transactions via a form, so that I can record income and expenses.

#### Acceptance Criteria

1. THE Frontend SHALL provide a form with fields: valor (number), descrição (text), categoria (dropdown), tipo (radio: receita/despesa), investment_type (dropdown: Individual/Conjunto/N/A)
2. THE Frontend SHALL validate that valor is greater than zero before submission
3. THE Frontend SHALL validate that descrição is between 1 and 200 characters
4. THE Frontend SHALL pre-populate categoria dropdown with all available categories
5. THE Frontend SHALL default investment_type to "N/A"
6. WHEN form is submitted with valid data, THE Frontend SHALL send POST request to /api/transactions
7. WHEN server responds with success, THE Frontend SHALL clear the form and display "✅ Transação criada com sucesso"
8. WHEN server responds with error, THE Frontend SHALL display error message and keep form data
9. WHEN #conjunto is in descrição, THE Frontend SHALL show a hint that investment_type will be set to Conjunto

### Requirement 16: Transaction Deletion UI

**User Story:** As a user, I want to delete a transaction by its ID, so that I can remove incorrect entries.

#### Acceptance Criteria

1. THE Frontend SHALL provide a deletion interface in an expandable section
2. THE Frontend SHALL require user to input the transaction ID manually
3. THE Frontend SHALL validate UUID format before enabling delete button
4. THE Frontend SHALL require a confirmation checkbox labeled "Confirmar exclusão"
5. WHEN checkbox is checked, THE Frontend SHALL display warning "⚠️ A transação será removida permanentemente"
6. WHEN delete button is clicked with valid UUID and confirmation, THE Frontend SHALL send DELETE request to /api/transactions/:id
7. WHEN deletion succeeds, THE Frontend SHALL display "✅ Transação excluída" and refresh transaction list
8. WHEN UUID is invalid, THE Frontend SHALL display "❌ ID inválido. Use o formato UUID exibido na tabela"

### Requirement 17: Supabase Database Integration

**User Story:** As a developer, I want seamless integration with the existing Supabase database, so that no data migration is required.

#### Acceptance Criteria

1. THE Backend SHALL connect to Supabase PostgreSQL using the Supabase JavaScript client library (@supabase/supabase-js)
2. THE Backend SHALL read SUPABASE_URL and SUPABASE_ANON_KEY from environment variables
3. THE Backend SHALL use the existing "transactions" table schema without modifications
4. THE Backend SHALL use Supabase Auth for authentication without creating a custom auth system
5. THE Backend SHALL handle Supabase client errors gracefully and return appropriate HTTP status codes
6. THE Backend SHALL use Supabase Row Level Security (RLS) policies to isolate user data
7. THE Backend SHALL NOT expose service_role key to the frontend

### Requirement 18: Deployment Configuration

**User Story:** As a developer, I want the application configured for deployment on Vercel, so that it can be easily published and scaled.

#### Acceptance Criteria

1. THE FluxCash_System SHALL include a vercel.json configuration file OR next.config.js with proper output settings
2. THE FluxCash_System SHALL use environment variables for all secrets and configuration
3. THE FluxCash_System SHALL include a .env.example file documenting required environment variables
4. THE Frontend SHALL be built for production using `npm run build` or `yarn build`
5. THE Backend SHALL be deployable as serverless functions on Vercel
6. THE FluxCash_System SHALL include a README.md with deployment instructions
7. THE FluxCash_System SHALL configure CORS to allow requests from the production domain

### Requirement 19: Error Handling and User Feedback

**User Story:** As a user, I want clear error messages and loading states, so that I understand what the application is doing.

#### Acceptance Criteria

1. WHEN a network request is in progress, THE Frontend SHALL display a loading spinner or skeleton UI
2. WHEN a network request fails, THE Frontend SHALL display an error message with retry option
3. WHEN form validation fails, THE Frontend SHALL highlight invalid fields with red borders and error text
4. WHEN authentication fails, THE Frontend SHALL display generic error messages to prevent user enumeration
5. WHEN a 404 error occurs, THE Frontend SHALL display "Recurso não encontrado"
6. WHEN a 500 error occurs, THE Frontend SHALL display "Erro no servidor. Tente novamente."
7. THE Frontend SHALL use toast notifications OR alert banners for success/error feedback
8. THE Frontend SHALL auto-dismiss success messages after 3 seconds

### Requirement 20: Code Quality and Testing Setup

**User Story:** As a developer, I want proper code quality tools configured, so that the codebase remains maintainable.

#### Acceptance Criteria

1. THE FluxCash_System SHALL use ESLint for JavaScript/React linting with Airbnb or Standard config
2. THE FluxCash_System SHALL use Prettier for code formatting
3. THE FluxCash_System SHALL include a package.json with all dependencies properly versioned
4. THE FluxCash_System SHALL include npm scripts: start, build, test, lint
5. THE FluxCash_System SHALL use a .gitignore file excluding node_modules, .env, and build artifacts
6. THE FluxCash_System SHALL include a .prettierrc and .eslintrc configuration file
7. THE FluxCash_System SHALL set up Jest and React Testing Library for unit testing (configuration only, tests not required in this phase)
