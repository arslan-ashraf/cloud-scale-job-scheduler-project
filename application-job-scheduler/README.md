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

Dockerize the app:

```bash
docker compose up --build -d
```

Test health endpoint:

```bash
curl http://127.0.0.1:3000/healthz
```

should return:

```bash
{"status":"ok"}
```

Open http://localhost:3000.

## API

### Create an immediate job

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H 'Content-Type: application/json' \
  -d '{"name":"Send report", "payload":{"message":"Report generated"}}'
```

### Schedule a one-time job

Send an ISO-8601 `runAt` timestamp in the future:

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H 'Content-Type: application/json' \
  -d {"name":"Run later", "payload":{"message":"Hello"}, "runAt":"2027-01-01T12:00:00.000Z"}
```

### Create a recurring job

Uses standard 5-field cron syntax (server local time):

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H 'Content-Type: application/json' \
  -d {"name":"Periodic check", "payload":{"message":"Check complete"}," cronExpression":"*/5 * * * *"}
```

### List jobs

`GET /api/jobs`

### Get one job

`GET /api/jobs/:id`

### Delete a job or recurring schedule

`DELETE /api/jobs/:id`

## Limitations

- No authentication or authorization
- In-memory data only, restart loses all jobs and schedules
- The demo executor does not execute any code or external work
- Recurring schedules create a separate history record for each run. Deleting the parent schedule stops future runs but run-history records remain