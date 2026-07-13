# FluxCash

Aplicação de gestão financeira pessoal com categorização automática de transações e acompanhamento de investimentos. Migrado de Python/Streamlit para Next.js (App Router) + TypeScript + Supabase.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS (tema dark/neon)
- Supabase (PostgreSQL + Auth)
- Zod para validação
- React Query para estado de servidor
- React Hook Form para formulários
- Recharts para visualizações
- Jest + React Testing Library

## Configuração local

### 1. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com as credenciais do seu projeto Supabase:

```bash
cp .env.example .env.local
```

| Variável                        | Descrição                                                 |
| ------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL do projeto Supabase (`https://<projeto>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima (pública) do Supabase                       |

Essas variáveis são expostas ao cliente (prefixo `NEXT_PUBLIC_`) pois o Supabase usa Row Level Security (RLS) para proteger os dados — nunca exponha a `service_role` key no frontend.

### 2. Instalar dependências

```bash
npm install
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts disponíveis

| Script           | Descrição                                                |
| ---------------- | -------------------------------------------------------- |
| `npm run dev`    | Inicia o servidor de desenvolvimento                     |
| `npm run build`  | Gera o build de produção                                 |
| `npm start`      | Inicia o servidor de produção (requer build prévio)      |
| `npm test`       | Executa a suíte de testes (Jest + React Testing Library) |
| `npm run lint`   | Executa o ESLint                                         |
| `npm run format` | Formata o código com Prettier                            |

## Deploy no Vercel

1. Crie um novo projeto no [Vercel](https://vercel.com/new) apontando para este repositório (diretório `app/` como root).
2. Configure as variáveis de ambiente no painel do Vercel (Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ALLOWED_ORIGIN` (opcional — domínio de produção para CORS, ex: `https://seu-dominio.vercel.app`)
3. O Vercel detecta automaticamente o framework Next.js e usa as configurações em `vercel.json`.
4. Clique em Deploy. O banco de dados Supabase já existente é reutilizado sem necessidade de migração.

## Banco de dados

Este projeto reutiliza um banco Supabase PostgreSQL já existente, com a tabela `transactions` e Row Level Security (RLS) habilitada para isolar os dados por usuário. Nenhuma migração de schema é necessária.
