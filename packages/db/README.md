# @n8n/db

Database package for the workflow automation platform using Prisma ORM with PostgreSQL.

## Models

- **Users** - User accounts & authentication
- **Projects** - Project containers for organizing workflows
- **Workflows** - Workflow definitions (nodes & edges as JSON)
- **Credentials** - Third-party service configs
- **WorkflowExecutions** - Workflow run history
- **NodeExecutions** - Individual node execution logs

## Installation

Add it to your `package.json` dependencies:

```json
{
  "dependencies": {
    "@n8n/db": "workspace:*"
  }
}
```

## Setup

1. Set your `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/n8n"
   ```
2. Generate the Prisma client:
   ```bash
   bun db:generate
   ```
3. Run migrations:
   ```bash
   bun db:migrate    # development
   bun db:deploy     # production
   ```

## Usage

```typescript
import { prisma } from "@n8n/db";

// Example: Get all workflows for a project
const workflows = await prisma.workflows.findMany({
  where: { projectId: "project_123" },
});
```

## Exports

| Export   | Description                              |
| -------- | ---------------------------------------- |
| `prisma` | Prisma client instance                   |
| `*`      | All generated Prisma types (from client) |
