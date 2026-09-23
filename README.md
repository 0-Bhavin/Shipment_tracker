# Shipment Status Tracker

A small full-stack app for tracking shipments through status stages, with full status history.

## Tech Choices

- **Backend:** Express + TypeScript + SQL (`pg`) against Postgres. No ORM — the schema is two small tables, so an ORM would add indirection without saving meaningful code.
- **Frontend:** React + TypeScript + Vite. Chosen over Next.js because the app has no
  routing or SSR needs — a single page with a modal detail view.
- **Database:** Postgres. Status changes are transactional (shipment update + history insert happen in one DB transaction) so the history log can never drift from the current status.

## Local Setup

See the build guide for full steps. Summary:

1. `docker compose up -d` (starts Postgres)
2. `cd backend && npm install && npm run migrate && npm run dev`
3. `cd frontend && npm install && npm run dev`
4. Open http://localhost:5173

## Assumptions

- Status is a fixed set (`Booked`, `In Transit`, `Customs Hold`, `Delivered`, `Cancelled`),
  not free text, and transitions between them are not restricted.
- `reference_number` is unique; `expected_delivery_date` is optional.
- No auth/multi-user — out of scope as per the assignment.

## Scaling to 10,000 Shipments / Concurrent Users
If this needed to support 10,000 shipments and multiple concurrent users, the biggest changes would be: 
(1) add pagination and server-side sorting to the shipment list instead of returning every row — `LIMIT`/`OFFSET` or keyset pagination on `created_at`; 
(2) move from a single shared `Pool` with default settings to a tuned connection pool (and possibly PgBouncer) to handle concurrent writes safely; 
(3) add optimistic locking or a `version` column on `shipments` so two concurrent status updates can't silently overwrite each other; (
4) introduce request validation (e.g. `zod`) and rate limiting now that more than one person is hitting the API; 
(5) add basic auth/authorization, since "who changed what" starts to matter once it's multi-user.
(6) consider caching the list endpoint (e.g. short-lived Redis cache) if search/filter becomes a hot path. None of this needs to be built now — the current schema (normalized shipment + history tables, indexed on status and reference number) is the same one I would scale, not one I would throw away.

## Live Links

- Frontend: (https://shipment-tracker-neon.vercel.app/)
- Backend: shipmenttracker-production.up.railway.app

## Reference
