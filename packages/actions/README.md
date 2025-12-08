# @n8n/actions

A package that provides action providers and their configurations for the n8n workflow automation platform.

## Overview

This package exports a collection of **Providers**, each containing:

- **Actions** - Executable functions with configurable parameters
- **Form Fields** - UI configuration for credential inputs
- **Credential Mapping** - How credentials map to environment variables
- **Icons** - Visual representations for the UI

## Available Providers

| Provider   | Description                                  |
| ---------- | -------------------------------------------- |
| `triggers` | Trigger-based actions for starting workflows |
| `resend`   | Email sending capabilities via Resend API    |
| `system`   | System-level actions and utilities           |

## Installation

Add it to your `package.json` dependencies:

```json
{
  "dependencies": {
    "@n8n/actions": "workspace:*"
  }
}
```

## Usage

```typescript
import { PROVIDERS } from "@n8n/actions";
import type { Provider, ActionConfigField } from "@n8n/actions/types";

// Access all available providers
PROVIDERS.forEach((provider) => {
  console.log(provider.label, provider.actions);
});
```

## Exports

| Export              | Description                                     |
| ------------------- | ----------------------------------------------- |
| `PROVIDERS`         | Array of all available action providers         |
| `Provider`          | TypeScript type for a provider definition       |
| `ActionConfigField` | TypeScript type for action configuration fields |
| `ProviderType`      | Union type of available provider types          |
