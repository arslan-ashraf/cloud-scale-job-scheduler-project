import assert from 'node:assert/strict';
import request from 'supertest';
import { app, jobs, schedules } from '../app.js';

describe('Job Scheduler REST API (integration)', function () {
  beforeEach(function () {
    for (const task of schedules.values()) task.stop?.();
    schedules.clear();
    jobs.clear();
  });

  after(function () {
    for (const task of schedules.values()) task.stop?.();
    schedules.clear();
    jobs.clear();
  });

  it('creates a job and returns its details', async function () {
    const response = await request(app)
      .post('/api/jobs')
      .send({ name: 'Integration job', payload: { message: 'test' } })
      .expect(201)
      .expect('Content-Type', /json/);

    assert.equal(response.body.name, 'Integration job');
    assert.equal(response.body.type, 'immediate');
    assert.ok(response.body.id);

    await request(app).get(`/api/jobs/${response.body.id}`).expect(200)
      .then(result => assert.equal(result.body.id, response.body.id));
  });

  it('lists jobs', async function () {
    await request(app).post('/api/jobs').send({ name: 'Listed job' }).expect(201);
    const response = await request(app).get('/api/jobs').expect(200);
    assert.ok(Array.isArray(response.body));
    assert.ok(response.body.some(job => job.name === 'Listed job'));
  });

  it('rejects a request containing both runAt and cronExpression', async function () {
    const response = await request(app).post('/api/jobs').send({
      name: 'Invalid', runAt: new Date(Date.now() + 60_000).toISOString(), cronExpression: '*/5 * * * *'
    }).expect(400);
    assert.match(response.body.error, /either runAt or cronExpression/);
  });

  it('rejects an invalid runAt value', async function () {
    const response = await request(app).post('/api/jobs').send({ name: 'Invalid date', runAt: 'not-a-date' }).expect(400);
    assert.match(response.body.error, /valid date\/time/);
  });

  it('returns 404 for a job that does not exist', async function () {
    await request(app).get('/api/jobs/does-not-exist').expect(404);
  });

  it('deletes a job and then returns 404 for it', async function () {
    const created = await request(app).post('/api/jobs').send({ name: 'Delete me' }).expect(201);
    await request(app).delete(`/api/jobs/${created.body.id}`).expect(204);
    await request(app).get(`/api/jobs/${created.body.id}`).expect(404);
  });

  it('renders the dashboard', async function () {
    const response = await request(app).get('/').expect(200);
    assert.match(response.text, /Job Scheduler/i);
  });
});