# FluxCash

Aplicação de gestão financeira pessoal com categorização automática de transações e acompanhamento de investimentos. 100% local: dados armazenados em um arquivo SQLite no disco, sem serviços externos.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS (tema dark/neon)
- SQLite local (`node:sqlite`)
- Zod para validação
- React Query para estado de servidor
- React Hook Form para formulários
- Recharts para visualizações
- Jest + React Testing Library

## Configuração local

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar em desenvolvimento

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

## Banco de dados

Os dados são armazenados em `data/fluxcash.db`, um arquivo SQLite criado automaticamente na raiz do projeto na primeira execução. Não requer nenhum serviço externo nem configuração — o arquivo fica fora do controle de versão (`.gitignore`).

Por depender de um arquivo local em disco, este projeto não é compatível com deploys serverless (Vercel, etc.) sem adaptação — foi desenhado para rodar localmente ou em um servidor com disco persistente.
