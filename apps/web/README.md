# n8n Web

The frontend web application for the n8n workflow automation platform, built with Next.js 16.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **UI**: [Radix UI](https://radix-ui.com) primitives + [Tailwind CSS](https://tailwindcss.com)
- **State**: [Jotai](https://jotai.org) for atomic state management
- **Auth**: [Better Auth](https://better-auth.com) for authentication
- **Flow Editor**: [React Flow](https://reactflow.dev) (@xyflow/react)

## Features

- **Authentication** - Sign in / Sign up with email or OAuth providers
- **Projects** - Organize workflows into projects
- **Workflow Canvas** - Visual node-based workflow editor
- **Credentials** - Manage third-party service credentials

## Getting Started

1. Install dependencies from the monorepo root:

   ```bash
   pnpm install
   ```

2. Set up environment variables (copy `.env.example` to `.env.local`)

3. Run the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (sign-in, sign-up)
│   ├── (sidebarProvider)/  # Main app with sidebar
│   │   ├── projects/       # Projects pages
│   │   └── workflows/      # Workflow editor
│   └── api/                # API routes
│       ├── auth/           # Auth endpoints
│       ├── credentials/    # Credentials API
│       ├── projects/       # Projects API
│       └── workflows/      # Workflows API
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities & configs
└── store/                  # Jotai state stores
```

## Scripts

| Command       | Description               |
| ------------- | ------------------------- |
| `pnpm dev`    | Start development server  |
| `pnpm build`  | Build for production      |
| `pnpm start`  | Start production server   |
| `pnpm lint`   | Run ESLint                |
| `pnpm format` | Format code with Prettier |
