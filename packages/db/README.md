# @n8n/db

Database package for the workflow automation platform using Prisma ORM with PostgreSQL.

## Models

- **Users** - User accounts & authentication
- **Sessions** - Session management
- **Accounts** - OAuth provider accounts
- **Workflows** - Workflow definitions (nodes & edges as JSON)
- **Integrations** - Third-party service configs
- **WorkflowExecutions** - Workflow run history
- **NodeExecutions** - Individual node execution logs

## Setup

1. Set your `DATABASE_URL` in `.env`
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
import { prisma } from '@n8n/db';

// Example: Get all workflows for a user
const workflows = await prisma.workflows.findMany({
  where: { userId: 'user_123' }
});
```
