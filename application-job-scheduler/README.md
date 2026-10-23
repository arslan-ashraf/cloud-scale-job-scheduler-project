# Taskflow — Job Scheduler MVP

A small Node.js + Express + EJS job scheduler with a responsive dashboard and JSON API. Jobs and schedules are held in memory, so all data disappears when the process restarts. The executor is intentionally a demo that waits briefly and returns the job message; replace it with your real task handler.

## Run locally

Requires Node.js 26+.

```bash
npm install
```

To run all tests:

```bash
npm test
```

To run only unit tests:

```bash
npm run test:unit
```

To run only integration tests:

```bash
npm run test:integration
```

To run application:

```bash
npm start
```

Open http://localhost:3000.

## API

### Create an immediate job

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H 'Content-Type: application/json' \
  -d '{"name":"Send report","payload":{"message":"Report generated"}}'
```

### Schedule a one-time job

Send an ISO-8601 `runAt` timestamp in the future:

```json
{"name":"Run later","runAt":"2027-01-01T12:00:00.000Z","payload":{"message":"Hello"}}
```

### Create a recurring job

Uses standard 5-field cron syntax (server local time):

```json
{"name":"Periodic check","cronExpression":"*/5 * * * *","payload":{"message":"Check complete"}}
```

### List jobs

`GET /api/jobs`

### Get one job

`GET /api/jobs/:id`

### Delete a job or recurring schedule

`DELETE /api/jobs/:id`

## MVP limitations

- No authentication or authorization, as requested. Do not expose publicly without adding access controls.
- In-memory data is not durable; restart loses all jobs and schedules.
- The demo executor does not execute arbitrary code or external work.
- Long one-time delays beyond Node's maximum timeout are not robustly handled; production scheduling needs durable storage and a worker/queue architecture.
- Recurring schedules create a separate history record for each run. Deleting the parent schedule stops future runs; run-history records remain.
- This is a single-process MVP, not a production-grade distributed scheduler.
