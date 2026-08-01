# MongoDB Connection with Mongoose — Design

**Date:** 2026-08-01
**Status:** Approved

## Overview

Add a MongoDB connection layer to the Auth-Service using Mongoose, replacing the
current Postgres/Sequelize setup entirely. This covers only the connection
infrastructure (no Mongoose schemas yet). Existing code that depends on the
removed Sequelize models will remain broken until rebuilt on Mongoose in a later
effort.

## Decisions

- **Approach:** Pattern-consistent module — a `MongoConnection` module that
  mirrors the existing `PostgresConnection`/`RedisConnection` style.
- **Scope:** Connection layer only. No Mongoose models/schemas in this change.
- **Coexistence:** MongoDB replaces Postgres. Postgres is removed fully.
- **Target:** MongoDB runs on the developer's local machine (`localhost:27017`).

## Components

### 1. New Mongo connection module — `src/Database/MongoConnection.ts`

- `connectMongo()`: async function that calls
  `mongoose.connect(config.mongo.uri, { serverSelectionTimeoutMS: 5000 })`.
  Logs success via the existing `logger`; on failure logs the error and calls
  `process.exit(1)` (mirrors current `PostgresConnection` behavior).
- Event listeners on `mongoose.connection`: `connected`, `error`,
  `disconnected`, `reconnected` — each wired to the existing logger (same style
  as `RedisConnection.ts`).
- Default export: the `mongoose` instance, available for future model
  registration.

### 2. Configuration — `src/Config/config.ts`

- Add a `mongo` block:
  - `uri: parsedEnv.MONGO_URI || 'mongodb://localhost:27017/paymentsvc'`
- Remove the Postgres `database` block (`host`, `port`, `name`, `username`,
  `password`).

### 3. Environment files

- `.env` and `.env.example`:
  - Remove all `DB_*` entries.
  - Add `MONGO_URI=mongodb://localhost:27017/paymentsvc`.
- `docker-compose.yml`: unchanged. Mongo runs locally on the developer's machine.

### 4. App lifecycle wiring — `src/app.ts`

- Replace `import { connection } from './Database/PostgresConnection'` with
  `import { connectMongo } from './Database/MongoConnection'`.
- In `connect()`: call `await connectMongo()`.
- In `disconnect()`: also call `await mongoose.disconnect()` for graceful
  shutdown.

### 5. Postgres removal

Delete the following files/directories:

- `src/Database/PostgresConnection.ts`
- `src/Models/` (entire directory: `User.model.ts`, `Role.model.ts`,
  `Address.model.ts`, `Auth.model.ts`, `BusinessDetail.model.ts`,
  `BaseModel.ts`, `index.ts`)
- `src/Repository/` (entire directory: `User.repository.ts`,
  `Role.repository.ts`, `Auth.repository.ts`, `Address.repositoty.ts`,
  `index.ts`)
- `src/Migrations/`
- `.sequelizerc`
- `src/Config/database.js`

Edit `src/Middlewares/ErrorHandler.ts`:

- Remove the `import { ValidationError, UniqueConstraintError,
  ForeignKeyConstraintError } from 'sequelize'` line and its three `else if`
  branches.

Edit `package.json`:

- Remove scripts: `migrate`, `migrate:undo`, `migrate:create`.
- Remove dependencies: `sequelize`, `sequelize-cli`, `sequelize-typescript`,
  `pg`, `pg-hstore`, `@types/pg`.
- Add dependency: `mongoose`.

## Data Flow

1. App starts → `App.initialize()` → `App.connect()` → `connectMongo()`.
2. Mongoose connects to the URI from `config.mongo.uri`.
3. Connection lifecycle events are logged.
4. On shutdown → `App.disconnect()` → server closes and Mongoose disconnects.

## Error Handling

- Connection failure at startup: logged and `process.exit(1)` — same behavior
  as the current Postgres connection.
- Runtime connection errors after startup: logged via the `error` event
  listener; the app continues running (same pattern as Redis).

## Known Impact / Acknowledged Breakage

The following files import the deleted Sequelize models or the removed
`sequelize` default export. They will fail to compile until ported to Mongoose
in a later effort:

- `src/Services/User.service.ts`
- `src/Services/SocialAuth.service.ts`
- `src/Middlewares/Auth.middleware.ts`

## Verification

- `npm run build` (tsc): confirm the **only** remaining errors are in the three
  known-orphaned files above — not in the new Mongo connection module or the
  wiring.
- Startup check: run the app locally and confirm the connection log line for
  MongoDB appears without error.
