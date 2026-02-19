# ContractFlow

**Sistema de gerenciamento de contratos e faturamento** — painel administrativo construído com Next.js (App Router), TypeScript, Tailwind CSS e Prisma.

---

## 📌 Visão rápida

- Aplicação CRUD para clientes, contratos e faturas com dashboard e relatórios.
- Autenticação com NextAuth, validações com Zod e formulários com React Hook Form.
- Persistência via Prisma + PostgreSQL (ex.: Neon) e seed para dados iniciais.

---

## ✅ Principais funcionalidades

- Dashboard com KPIs e gráficos
- Gestão de clientes, contratos e faturas
- Notificações e histórico de atividades
- Relatórios resumidos (receita, contratos ativos, faturas pendentes)
- Autenticação e gerenciamento de usuários

---

## 🧰 Stack técnica

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma (PostgreSQL)
- NextAuth (autenticação)
- React Hook Form + Zod (validação)
- Recharts (gráficos)

---

## 🚀 Rodando localmente (rápido)

Pré-requisitos: Node 18+ e um banco PostgreSQL.

1. Instalar dependências:

   ```bash
   npm install
   ```

2. Criar um arquivo `.env` baseado em `.env.example` e definir `DATABASE_URL` e `NEXTAUTH_SECRET`.

3. Inicializar o banco e popular dados de exemplo:

   ```bash
   npm run db:push   # aplica schema no banco
   npm run db:seed   # popula dados de exemplo
   ```

4. Rodar em desenvolvimento:

   ```bash
   npm run dev
   ```

Acesse http://localhost:3000

---

## 📁 Scripts úteis

- `npm run dev` — inicia em modo desenvolvimento
- `npm run build` — gera build (executa `prisma generate` antes)
- `npm run start` — inicia o build em produção
- `npm run db:push` — aplica schema ao banco
- `npm run db:seed` — popula dados de exemplo
- `npm run db:studio` — abre Prisma Studio

---

## 🔧 Estrutura (resumo)

- `src/app` — rotas e páginas (dashboard, auth, APIs)
- `src/components` — componentes UI reutilizáveis
- `src/lib` — helpers, autenticação e Prisma client
- `prisma` — schema e seed

---

## 📣 Dicas para recrutadores

- Código organizado com foco em escalabilidade e boas práticas (Typescript + validação forte).
- Pronto para deploy em Vercel (variáveis de ambiente e `DATABASE_URL`).
- Testes automatizados não incluídos (podemos adicionar se necessário).

---

## 🤝 Como contribuir / ver o projeto

- Abra uma Issue ou envie um Pull Request.
- Para dúvidas ou demo, use o perfil do GitHub do repositório.

---

**Status:** Em desenvolvimento — pronto para revisão técnica por recrutadores.

