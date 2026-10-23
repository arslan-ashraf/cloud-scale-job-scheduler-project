// const assert = require('node:assert/strict');
import assert from 'node:assert/strict';
import { createJob, jobs, schedules } from '../app.js';

describe('createJob (unit)', function () {
  afterEach(function () {
    for (const task of schedules.values()) task.stop?.();
    schedules.clear();
    jobs.clear();
  });

  it('creates an immediate job with sensible defaults', function () {
    const job = createJob({ name: 'Send report', payload: { message: 'hello' } });
    assert.ok(job.id);
    assert.equal(job.name, 'Send report');
    assert.equal(job.type, 'immediate');
    assert.equal(job.status, 'queued');
    assert.deepEqual(job.payload, { message: 'hello' });
    assert.equal(jobs.get(job.id), job);
  });

  it('creates a future-dated job in scheduled status', function () {
    const runAt = new Date(Date.now() + 60_000).toISOString();
    const job = createJob({ name: 'Later', runAt });
    assert.equal(job.type, 'scheduled');
    assert.equal(job.status, 'scheduled');
    assert.equal(job.runAt, runAt);
    assert.ok(schedules.has(job.id));
  });

  it('creates a recurring job for a valid cron expression', function () {
    const job = createJob({ name: 'Repeat', cronExpression: '*/5 * * * *' });
    assert.equal(job.type, 'recurring');
    assert.equal(job.status, 'scheduled');
    assert.equal(job.cronExpression, '*/5 * * * *');
    assert.ok(schedules.has(job.id));
  });

  it('rejects an invalid cron expression and does not retain the job', function () {
    assert.throws(() => createJob({ name: 'Bad schedule', cronExpression: 'not-a-cron' }), /Invalid cron expression/);
    assert.equal(jobs.size, 0);
  });
});