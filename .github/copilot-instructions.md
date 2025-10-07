# WhatsApp Group Manager Bot - Copilot Instructions

## Repository Overview

This is a **WhatsApp group management bot** built with Node.js, TypeScript, and Express.js. It automatically manages group membership, enforces blacklist rules, and tracks user activity through webhook-based event processing from Evolution API.

**Key Stats:**

- **Language:** TypeScript (ES2020 modules)
- **Runtime:** Node.js v20
- **Framework:** Express.js v5
- **Database:** PostgreSQL via Prisma ORM
- **Size:** ~49 TypeScript source files
- **Architecture:** Webhook-driven microservices with real-time event processing

## Critical Build Information

### Prerequisites

- Node.js v20 (specified in CI)
- npm v10+
- PostgreSQL database (for runtime, not required for build/test)

### Build Sequence (ALWAYS follow this order)

**Complete clean build from scratch:**

```bash
npm ci                    # ~8s - ALWAYS use 'npm ci' not 'npm install'
npx prisma generate       # ~0.2s - Generate Prisma Client (optional if already run)
npm run build            # ~3.5s - Builds TypeScript and resolves path aliases
```

**Important:** The build command runs 3 steps sequentially:

1. `npm run build:ts` - TypeScript compilation
2. `npm run build:alias` - Resolve path aliases with tsc-alias
3. `tsc-esm-fix dist` - Fix ESM imports (required for ES2020 modules)

### Validation Commands

**Run in this exact order before committing:**

```bash
npm run format:check     # Check Prettier formatting
npm run lint            # ESLint (warnings for console.log are normal)
npm run type-check      # TypeScript type checking
npm test                # Jest tests (~5s, 68+ tests)
npm run build           # Final build verification
```

**Quick fix-all command:**

```bash
npm run fix-all         # Runs format + lint:fix together
```

### Known Build Behaviors

1. **Linting warnings:** Console.log warnings in test files are NORMAL and expected
2. **npm ci vs npm install:** ALWAYS use `npm ci` for reproducible builds
3. **Prisma generate:** Automatically runs in Dockerfile but may need manual execution during development
4. **Test execution:** Uses `--passWithNoTests` flag, so passing with 0 tests is valid
5. **Build output:** Located in `dist/` directory (gitignored)

## Project Structure

### Root Directory Layout

```
/
├── .github/workflows/ci.yml    # CI/CD pipeline
├── prisma/schema.prisma        # Database schema (PostgreSQL)
├── src/                        # TypeScript source code
├── dist/                       # Build output (gitignored)
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript config with path aliases
├── jest.config.js              # Jest test configuration
├── eslint.config.js            # ESLint v9 flat config
├── .prettierrc.json            # Prettier formatting rules
└── docker-compose.yml          # Multi-container setup
```

### Source Code Organization (`src/`)

**Path Aliases (defined in tsconfig.json):**

- `@logic/*` → `src/logic/*` (business logic)
- `@routes/*` → `src/routes/*` (API controllers)
- `@services/*` → `src/services/*` (external API services)
- `@database/*` → `src/database/*` (Prisma client & repositories)
- `@config` → `src/config.ts` (environment configuration)
- `@constants/*` → `src/constants/*` (route paths, message templates)
- `@utils/*` → `src/utils/*` (error handling, response helpers)

**Key Directories:**

```
src/
├── index.ts                    # Express server entry point
├── config.ts                   # Environment variables configuration
├── featureFlags.ts             # Feature flag system
├── logic/                      # Core business logic
│   ├── botLogic.ts            # Main webhook event orchestration
│   ├── handlers.ts            # Event handler mapping
│   ├── helpers.ts             # Business logic utilities
│   ├── mappers.ts             # Data transformation functions
│   └── services/              # Domain services (12 files)
│       ├── blacklistService.ts
│       ├── groupService.ts
│       ├── messageService.ts
│       ├── removalWorkflowService.ts
│       └── ...
├── routes/                     # Express route controllers
│   ├── routes.ts              # Main router configuration
│   ├── webhookController.ts   # Webhook entry point
│   ├── blacklistController.ts
│   ├── removalQueueController.ts
│   └── ...
├── database/                   # Data access layer
│   ├── prisma.ts              # Prisma client singleton
│   └── repositories/          # Database repositories (11 files)
├── services/                   # External API integrations
│   ├── groupService.ts        # Evolution API - group operations
│   └── messageService.ts      # Evolution API - messaging
├── constants/                  # Application constants
│   ├── routesConstants.ts     # API route paths
│   ├── evolutionConstants.ts  # Evolution API events
│   └── messagesConstants.ts   # Message templates
├── utils/                      # Shared utilities
│   ├── AppError.ts            # Custom error class
│   ├── catchAsync.ts          # Async error wrapper
│   ├── errorHandler.ts        # Express error middleware
│   └── resSuccess.ts          # Standard response helper
└── types/
    └── evolution.d.ts         # Evolution API type definitions
```

## Architecture & Data Flow

**System Architecture:**

1. **Evolution API** (WhatsApp Web wrapper) sends webhooks to Express server
2. **Webhook Controller** (`webhookController.ts`) receives events
3. **Bot Logic** (`botLogic.ts`) routes events to appropriate handlers
4. **Domain Services** (`logic/services/`) implement business logic
5. **Repositories** (`database/repositories/`) handle database operations
6. **External Services** (`services/`) call Evolution API for WhatsApp actions

**Key Entry Points:**

- Webhook events: `POST /webhook` → `webhookController.ts`
- Admin API: Routes defined in `routes/routes.ts`
- Main server: `src/index.ts` (Express app on port 3000)

## Database Information

**ORM:** Prisma v6.16.1
**Database:** PostgreSQL

**Key Models:**

- `User` - WhatsApp users
- `Group` - WhatsApp groups
- `GroupMembership` - User-group relationships with activity tracking
- `Message` - Activity tracking
- `Whitelist`/`Blacklist` - Member management
- `RemovalQueue` - Batch removal processing
- `RemovalHistory` - Audit trail
- `WebhookEvent` - Event logging

**Prisma Commands:**

```bash
npx prisma generate          # Generate Prisma Client
npx prisma migrate dev       # Run migrations (requires DATABASE_URL)
npx prisma studio            # Open Prisma Studio on port 5555
```

**Important:** Prisma Client is auto-generated at `node_modules/@prisma/client`. The build process requires `npx prisma generate` if starting from a fresh clone.

## CI/CD Pipeline (GitHub Actions)

**Workflow:** `.github/workflows/ci.yml`

**Steps executed on push/PR to main:**

1. Checkout code
2. Setup Node.js v20 with npm caching
3. `npm ci` - Install dependencies
4. `npm run format:check` - Prettier validation
5. `npm run lint` - ESLint validation
6. `npm run type-check` - TypeScript validation
7. `npm test` - Run Jest tests
8. `npm run build` - Build project
9. Smoke test: Start server for 5 seconds and verify no crashes

**To ensure CI passes:**

- Run all validation commands locally before pushing
- Ensure no TypeScript errors (warnings for console.log are acceptable)
- Ensure all tests pass
- Ensure build completes successfully

## Environment Variables

**Configuration file:** `src/config.ts`

**Required for runtime (not build/test):**

- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string (Prisma)
- `EVOLUTION_API_URL` - Evolution API endpoint
- `EVOLUTION_API_KEY` - Evolution API authentication
- `EVOLUTION_INSTANCE_NAME` - Instance identifier
- `WA_VICKY_NUM` / `WA_VICKY_ID` / `WA_GROUP_TEST` - WhatsApp IDs for testing
- `FEATURE_AUTO_REMOVAL` / `FEATURE_BLACKLIST_ENFORCEMENT` / `FEATURE_QUEUE_REMOVAL` - Feature flags

**Note:** Tests and builds work WITHOUT environment variables (use mocks/defaults).

## Code Style & Linting

**Linter:** ESLint v9 (flat config in `eslint.config.js`)
**Formatter:** Prettier (config in `.prettierrc.json`)

**Style Guidelines:**

- Use TypeScript strict mode
- Use ES2020 module syntax (`import`/`export`)
- Use path aliases (`@logic/`, `@routes/`, etc.) not relative paths
- Prefer `const` over `let`, never use `var`
- Use `eqeqeq` (always `===` not `==`)
- Always use curly braces for conditionals
- Prettier handles all formatting (tabs, semicolons, single quotes, 80 char width)

**Common patterns in codebase:**

- Controllers use `catchAsync()` wrapper for error handling
- Responses use `resSuccess()` helper
- Errors throw `AppError` class
- Feature flags checked via `featureFlags.ts`
- All database access through repository pattern

## Testing

**Framework:** Jest with ts-jest
**Test files:** `*.test.ts` co-located with source files

**Test types:**

- Unit tests: Most test files
- Integration tests: Testing API contract structures (not full E2E)

**Note:** Tests are mostly structural validation, not full mocks. Console output during tests is normal and expected.

## Docker Information

**Files:** `Dockerfile`, `docker-compose.yml`

**Services:**

- `whatsapp-bot` - Main application
- `bot-postgres` - Application database
- `evolution-api` - WhatsApp Web API
- `evolution-postgres` - Evolution API database
- `evolution-redis` - Evolution API cache

**Dev command:** `npm run dev` (uses `tsx watch` with hot reload)
**Docker build:** Multi-stage build with `npm ci`, Prisma generate, and build

## Common Issues & Solutions

1. **Path alias errors in build:** Run `npm run build:alias` after `tsc`
2. **ESM import errors:** The `tsc-esm-fix` step is required for ES2020 modules
3. **Prisma Client not found:** Run `npx prisma generate`
4. **Tests fail with database errors:** Tests should NOT require database; check mocking
5. **Linter warnings about console.log:** These are intentional for debugging/logging

## Making Changes

**Typical workflow:**

1. Make code changes
2. Run `npm run format` or `npm run fix-all` to auto-fix style
3. Run `npm run type-check` to verify TypeScript
4. Run `npm test` to verify tests still pass
5. Run `npm run build` to ensure build works
6. Commit changes

**Adding new features:**

- Add domain logic to `src/logic/services/`
- Add API endpoints to `src/routes/`
- Add database operations to `src/database/repositories/`
- Add tests co-located with implementation files
- Update route constants in `src/constants/routesConstants.ts`

**Modifying database:**

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Run `npx prisma generate`

## Performance Notes

- **npm ci:** ~8 seconds
- **npm test:** ~5 seconds (68+ tests)
- **npm run build:** ~3.5 seconds
- **CI pipeline total:** ~30-45 seconds

## Final Notes

- This is a demonstration/learning project for backend architecture skills
- The bot integrates with Evolution API (third-party WhatsApp Web wrapper)
- Real-time webhook processing is the core functionality
- Feature flags control optional behaviors (blacklist enforcement, removal workflows)
- Code uses extensive console logging for operational visibility (linter warnings expected)
- ALWAYS trust these instructions and only search/explore if information is incomplete or incorrect
