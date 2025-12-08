# n8n

A workflow automation platform built with a modern TypeScript monorepo architecture.

## Project Structure

```
n8n/
├── apps/
│   └── web/              # Next.js frontend application
├── packages/
│   ├── actions/          # Workflow action providers & configurations
│   └── db/               # Prisma database layer (PostgreSQL)
└── turbo.json            # Turborepo configuration
```

## Tech Stack

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Frontend | Next.js 16, React 19, Tailwind CSS, Radix UI |
| State    | Jotai                                        |
| Auth     | Better Auth                                  |
| Database | PostgreSQL with Prisma ORM                   |
| Monorepo | Turborepo + pnpm workspaces                  |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/akashwarrior/n8n.git
   cd n8n
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in `packages/db/`
   - Copy `.env.example` to `.env.local` in `apps/web/`

4. Set up the database:

   ```bash
   cd packages/db
   bun db:generate
   bun db:migrate
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Apps & Packages

| Name           | Path               | Description                         |
| -------------- | ------------------ | ----------------------------------- |
| `web`          | `apps/web`         | Frontend web application            |
| `@n8n/actions` | `packages/actions` | Action providers for workflow nodes |
| `@n8n/db`      | `packages/db`      | Database client and Prisma schema   |

## Scripts

| Command      | Description                 |
| ------------ | --------------------------- |
| `pnpm dev`   | Start all apps in dev mode  |
| `pnpm build` | Build all apps and packages |
| `pnpm lint`  | Lint all packages           |
