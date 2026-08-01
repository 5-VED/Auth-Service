# MongoDB Connection with Mongoose — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use senior-staff-engineer:subagent-driven-development (recommended) or senior-staff-engineer:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Mongoose connection layer to Auth-Service and remove the Postgres/Sequelize stack entirely, per the approved spec at `docs/senior-staff-engineer/specs/2026-08-01-mongo-connection-design.md`.

**Architecture:** A new `src/Database/MongoConnection.ts` module mirrors the existing `RedisConnection`/`PostgresConnection` pattern (async connect function + event listeners + default export). Config is added to `src/Config/config.ts`, wired into `src/app.ts` connect/disconnect lifecycle. Postgres files (connection, models, repositories, migrations, sequelize config, deps, scripts) are deleted. Per the spec, the auth layer that imports the deleted modules will not compile until rebuilt on Mongoose later — this is accepted and out of scope.

**Tech Stack:** Node 18.19 (`.nvmrc`), TypeScript, Express, Mongoose 9.x, winston logger.

**Working directory:** All commands run from `E:\Software Development\Projects\PaymentSvc\Auth-Service`.

**Testing note:** This project has no test framework (`npm test` just echoes an error). The spec's verification is compile + startup checks, so tasks verify with `npm run build` and manual inspection rather than unit tests.

---

### Task 1: Install Mongoose

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install mongoose**

Run: `npm install mongoose`

Expected: `package.json` gains `"mongoose": "^9.x.x"` under `dependencies`, `package-lock.json` updates, `node_modules/mongoose` created.

- [ ] **Step 2: Verify install**

Run: `npm ls mongoose`
Expected: shows `mongoose@9.x.x`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add mongoose dependency"
```

---

### Task 2: Add `mongo` config and remove Postgres config

**Files:**
- Modify: `src/Config/config.ts:16-41`

- [ ] **Step 1: Edit config.ts**

Replace the `database` block (lines 22-28) with a `mongo` block. The config object becomes:

```ts
export const config = {
	env,
	isDevelopment: env === 'development',
	isProduction: env === 'production',
	isTest: env === 'test',
	port: Number(parsedEnv.PORT) || 3000,
	mongo: {
		uri: parsedEnv.MONGO_URI || 'mongodb://localhost:27017/paymentsvc',
	},
	server: {
		memoryUsageTimeOut: (parsedEnv.MEMORY_USAGE_TIMEOUT),
		activateNewRelic: true
	},
	jwt: {
		secret: parsedEnv.JWT_SECRET_KEY,
		expiresIn: parsedEnv.JWT_EXPIRES_IN,
	},
	kafka:{
		brokers: parsedEnv.KAFKA_BROKERS || parsedEnv.KAFKA_BROKER || 'localhost:9092',
		clientId: parsedEnv.KAFKA_CLIENT_ID || 'auth-service',
	}
};
```

Do not change any other part of the file (tabs/indentation in the `server`, `jwt`, `kafka` blocks should remain as-is).

- [ ] **Step 2: Verify no remaining `database.` references in config**

Run: `git grep -n "config.database" src`
Expected: no matches (the only consumer was `PostgresConnection.ts`, deleted in a later task).

- [ ] **Step 3: Commit**

```bash
git add src/Config/config.ts
git commit -m "refactor: replace postgres config with mongo config"
```

---

### Task 3: Create the Mongo connection module

**Files:**
- Create: `src/Database/MongoConnection.ts`

- [ ] **Step 1: Write the module**

Create `src/Database/MongoConnection.ts`:

```ts
import mongoose from 'mongoose';
import { config } from '../Config/config';
import logger from '../Config/Logger';

export const connectMongo = async (): Promise<void> => {
    try {
        await mongoose.connect(config.mongo.uri, {
            serverSelectionTimeoutMS: 5000,
        });
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

mongoose.connection.on('connected', () => logger.info('✅ MongoDB connected'));
mongoose.connection.on('error', (err) => logger.error('❌ MongoDB error:', err));
mongoose.connection.on('disconnected', () => logger.info('🔴 MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('♻️ MongoDB reconnected'));

export default mongoose;
```

Matches the `RedisConnection.ts` style (event listeners wired to logger) and the `PostgresConnection.ts` failure behavior (`process.exit(1)`).

- [ ] **Step 2: Typecheck the new module in isolation**

Run: `npx tsc --noEmit src/Database/MongoConnection.ts --esModuleInterop --skipLibCheck --target es2016 --module commonjs`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/Database/MongoConnection.ts
git commit -m "feat: add MongoDB connection module with mongoose"
```

---

### Task 4: Wire Mongo into the app lifecycle

**Files:**
- Modify: `src/app.ts:11`, `src/app.ts:47-55`, `src/app.ts:154-167`

- [ ] **Step 1: Swap the Postgres import for Mongo**

In `src/app.ts`, replace line 11:

```ts
import { connection } from './Database/PostgresConnection';
```

with:

```ts
import { connectMongo } from './Database/MongoConnection';
import mongoose from './Database/MongoConnection';
```

- [ ] **Step 2: Update `connect()`**

Replace the body of `connect()` (lines 47-55) with:

```ts
    public async connect(): Promise<void> {
        try {
            await connectMongo();
            logger.info('MongoDB connected successfully');
        } catch (error) {
            logger.error('MongoDB connection failed:', error);
            process.exit(1);
        }
    }
```

- [ ] **Step 3: Update `disconnect()`**

In `disconnect()`, after the server-close promise resolves and the success log, add the Mongo teardown. The final method becomes:

```ts
    public async disconnect(): Promise<void> {
        if (this.server) {
            await new Promise<void>((resolve, reject) => {
                this.server.close((err?: Error) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
            logger.info('Server stopped gracefully');
        }
        await mongoose.disconnect();
        logger.info('MongoDB disconnected gracefully');
    }
```

- [ ] **Step 4: Commit**

```bash
git add src/app.ts
git commit -m "feat: wire mongoose connection into app lifecycle"
```

---

### Task 5: Update environment files and Dockerfile

**Files:**
- Modify: `.env`, `.env.example`, `Dockerfile`

- [ ] **Step 1: Update `.env`**

Remove the `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` lines. Add:

```
MONGO_URI=mongodb://localhost:27017/paymentsvc
```

Keep all other lines (PORT, REDIS_*, JWT_*) unchanged.

- [ ] **Step 2: Update `.env.example`**

Replace the `# Database Configuration` block (lines 8-14):

```
# Database Configuration
MONGO_URI=mongodb://localhost:27017/paymentsvc
```

- [ ] **Step 3: Update Dockerfile**

In the `ENV` block (lines 16-30), remove the `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` entries and add:

```
    MONGO_URI=mongodb://localhost:27017/paymentsvc \
```

- [ ] **Step 4: Verify no `DB_` env refs remain**

Run: `git grep -n "DB_HOST\|DB_PORT\|DB_NAME\|DB_USER\|DB_PASSWORD" -- .env .env.example Dockerfile`
Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add .env .env.example Dockerfile
git commit -m "chore: replace postgres env vars with MONGO_URI"
```

---

### Task 6: Delete Postgres connection, models, repositories, migrations, and sequelize config

**Files:**
- Delete: `src/Database/PostgresConnection.ts`
- Delete: `src/Models/` (directory)
- Delete: `src/Repository/` (directory)
- Delete: `src/Migrations/` (directory)
- Delete: `.sequelizerc`
- Delete: `src/Config/database.js`

- [ ] **Step 1: Delete the files**

Run:

```powershell
Remove-Item -LiteralPath "src\Database\PostgresConnection.ts"
Remove-Item -LiteralPath "src\Models" -Recurse
Remove-Item -LiteralPath "src\Repository" -Recurse
Remove-Item -LiteralPath "src\Migrations" -Recurse
Remove-Item -LiteralPath ".sequelizerc"
Remove-Item -LiteralPath "src\Config\database.js"
```

- [ ] **Step 2: Verify deletions**

Run: `git status --short`
Expected: staged deletions for the six paths above (and nothing else).

- [ ] **Step 3: Commit**

```bash
git add -A src/Database/PostgresConnection.ts src/Models src/Repository src/Migrations .sequelizerc src/Config/database.js
git commit -m "refactor: remove postgres connection, models, repositories, and migrations"
```

---

### Task 7: Remove Sequelize error handling from ErrorHandler

**Files:**
- Modify: `src/Middlewares/ErrorHandler.ts:4`, `src/Middlewares/ErrorHandler.ts:53-86`

- [ ] **Step 1: Remove the sequelize import**

In `src/Middlewares/ErrorHandler.ts`, delete line 4:

```ts
import { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
```

- [ ] **Step 2: Remove the sequelize error branches**

Delete the three `else if` branches that reference `ValidationError`, `UniqueConstraintError`, and `ForeignKeyConstraintError` (lines 53-86). After removal, the `else if (err instanceof ApiError)` branch is followed directly by the JSON-parsing branch:

```ts
        if (err instanceof ApiError) {
            statusCode = err.statusCode;
            response = {
                success: false,
                message: err.message,
                data: err.data
            };

            if (process.env.NODE_ENV === 'development') {
                response.stack = err.stack;
            }
        }
        // Handle JSON parsing errors
        else if (err instanceof SyntaxError && 'body' in err) {
            statusCode = 400;
            response.message = 'Invalid JSON';
        }
```

Keep the `ValidationErrorDetail` interface if still referenced; if it becomes unused, delete it too.

- [ ] **Step 3: Commit**

```bash
git add src/Middlewares/ErrorHandler.ts
git commit -m "refactor: remove sequelize error handling"
```

---

### Task 8: Remove Sequelize from package.json scripts and dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Edit package.json**

Remove from `scripts`: `migrate`, `migrate:undo`, `migrate:create`.

Remove from `dependencies`: `pg`, `pg-hstore`, `sequelize`, `sequelize-cli`, `sequelize-typescript`.
Remove from `devDependencies`: `@types/pg`.

The scripts block becomes:

```json
  "scripts": {
    "start": "node dist/server.js",
    "start:dev": "nodemon",
    "build": "tsc",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

- [ ] **Step 2: Sync the lockfile**

Run: `npm install`
Expected: no errors; `package-lock.json` updates.

- [ ] **Step 3: Verify sequelize packages are gone**

Run: `npm ls sequelize sequelize-cli sequelize-typescript pg pg-hstore`
Expected: `npm ERR! code ELSPROBLEMS` style output indicating the packages are not installed, or empty output with exit code indicating not found.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove sequelize and pg dependencies and migrate scripts"
```

---

### Task 9: Verify build and confirm breakage scope

**Files:**
- None (verification only)

- [ ] **Step 1: Run the full build**

Run: `npm run build`
Expected: TypeScript compile errors **only** in the auth-layer files listed in the spec's "Known Impact" section — the direct importers (`src/Services/User.service.ts`, `src/Services/Role.service.ts`, `src/Services/SocialAuth.service.ts`, `src/Middlewares/Auth.middleware.ts`) and their upstream dependents (`src/Controllers/`, `src/Config/Passport.ts`, `src/Routers/`, `src/app.ts`).

Confirm the following files produce **no** errors:
- `src/Database/MongoConnection.ts`
- `src/Config/config.ts`
- `src/Middlewares/ErrorHandler.ts`

- [ ] **Step 2: Confirm no stray sequelize references remain in src**

Run: `git grep -in "sequelize\|PostgresConnection" src`
Expected: no matches.

- [ ] **Step 3: Record remaining compile errors**

Capture the full list of errors from Step 1 into a file for reference:

Run: `npm run build 2>&1 | Out-File -FilePath "build-errors-after-mongo.txt"`

Note in the plan handoff: the build will not fully succeed until the auth layer is ported to Mongoose (tracked separately).

---

### Task 10: Manual startup check of the Mongo connection

**Files:**
- None (manual verification)

Prerequisite: MongoDB running locally on `localhost:27017`.

- [ ] **Step 1: Temporarily stub the broken auth-layer files so the app can boot**

The auth layer imports deleted modules, so a full startup will fail. To verify only the Mongo wiring, temporarily comment out the route/import wiring that pulls in the broken files. The simplest approach: in `src/app.ts`, comment out the `initializeRoutes(new IndexRoute(this.app))` line and the `configurePassport()` call in the constructor so nothing imports the broken chain.

- [ ] **Step 2: Start the app**

Run: `npm run start:dev`
Expected in logs:
- `✅ MongoDB connected`
- `MongoDB connected successfully`
- Server banner `🚀 Server running in development mode on port 3000`

If MongoDB is not running, expect `MongoDB connection failed:` followed by `process exit code 1` — this confirms the failure path works.

- [ ] **Step 3: Stop the app and revert the stub**

Press Ctrl+C. Confirm the graceful-shutdown logs (`MongoDB disconnected gracefully`) appear.
Then revert the temporary stub edits in `src/app.ts` (restore `configurePassport()` and `initializeRoutes(...)`). Do **not** commit the stub.

---

### Task 11: Final review and commit any remaining changes

**Files:**
- None (verification only)

- [ ] **Step 1: Review the diff**

Run: `git status --short`
Expected: only the intended deletions/modifications from Tasks 1-8, plus the untracked `docs/senior-staff-engineer/plans/2026-08-01-mongo-connection.md`.

- [ ] **Step 2: Confirm the Mongo connection module is correct**

Read `src/Database/MongoConnection.ts` and confirm it matches Task 3 Step 1, imports resolve, and it exports both `connectMongo` and the default `mongoose` instance.

- [ ] **Step 3: Final commit of any leftover plan/spec docs if untracked**

```bash
git add docs/senior-staff-engineer/plans/2026-08-01-mongo-connection.md
git commit -m "docs: add mongo connection implementation plan"
```

---

## Out of Scope (tracked separately)

- Porting `User`, `Role`, `Address`, `Auth` domain models to Mongoose schemas.
- Rebuilding `Repository/`, `Services/`, `Middlewares/Auth.middleware.ts`, `Controllers/`, and `Config/Passport.ts` against Mongoose.
- Restoring `npm run build` to full success and `npm start` to a bootable state.
- Adding a test framework (project currently has none).
