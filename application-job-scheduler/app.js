import express from 'express';
import cron from 'node-cron';
import crypto from 'node:crypto';
import path from 'path';

export const app = express();
const PORT = process.env.PORT || 3000;

// Export data maps
export const jobs = new Map();
export const schedules = new Map();

app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(import.meta.dirname, 'public')));


const now = () => new Date().toISOString();
const publicJob = job => ({ ...job });

async function execute(job) {
  if (job.status === 'running') return;

  job.status = 'running';
  job.startedAt = now();
  job.updatedAt = now();

  try {
    // MVP executor: replace this with your real task handler.
    await new Promise(resolve => setTimeout(resolve, 700));
    job.result = { message: job.payload?.message || 'Job executed successfully' };
    job.status = 'completed';
  } catch (error) {
    job.error = error.message;
    job.status = 'failed';
  }

  job.finishedAt = now();
  job.updatedAt = now();
}

export function createJob({ name, payload = {}, runAt, cronExpression }){

  const job = {
    id: crypto.randomUUID(),
    name: String(name || 'Untitled job').trim().slice(0, 120),
    payload: payload && typeof payload === 'object' ? payload : { message: String(payload) },
    type: cronExpression ? 'recurring' : runAt ? 'scheduled' : 'immediate',
    status: cronExpression ? 'scheduled' : runAt && new Date(runAt) > new Date() ? 'scheduled' : 'queued',
    createdAt: now(), 
    updatedAt: now(), 
    runAt: runAt || null,
    cronExpression: cronExpression || null, 
    lastRunAt: null, 
    result: null, 
    error: null
  };

  jobs.set(job.id, job);

  if (cronExpression) {

    if (!cron.validate(cronExpression)) {
      jobs.delete(job.id);
      throw new Error('Invalid cron expression. Example: */5 * * * * (every 5 minutes).');
    }

    const task = cron.schedule(cronExpression, async () => {
      const run = { 
        ...job, 
        id: crypto.randomUUID(), 
        type: 'recurring-run', 
        parentId: job.id,
        status: 'queued', 
        createdAt: now(), 
        updatedAt: now(), 
        runAt: null,
        cronExpression: null, 
        result: null, 
        error: null 
      };

      jobs.set(run.id, run);
      job.lastRunAt = now();
      job.updatedAt = now();

      await execute(run);

      job.updatedAt = now();
    });

    schedules.set(job.id, task);

  } else if (job.status === 'queued') {

    setImmediate(() => execute(job));

  } else {

    const delay = new Date(runAt).getTime() - Date.now();

    if (!Number.isFinite(delay) || delay < 0) {
      job.status = 'queued';
      setImmediate(() => execute(job));
    } else {
      const timer = setTimeout(() => execute(job), Math.min(delay, 2147483647));
      schedules.set(job.id, { stop: () => clearTimeout(timer) });
    }

  }
  return job;
}

app.get('/', (_req, res) => res.render('index', { 
  jobs: [...jobs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) 
}));

app.get('/api/jobs', (_req, res) => {
  res.json([...jobs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(publicJob));
});

app.post('/api/jobs', (req, res) => {
  const { name, payload, runAt, cronExpression } = req.body || {};

  if (runAt && cronExpression){
    return res.status(400).json({ error: 'Choose either runAt or cronExpression, not both.' });
  }

  if (runAt && !Number.isFinite(new Date(runAt).getTime())){
    return res.status(400).json({ error: 'runAt must be a valid date/time.' });
  }

  try {
    const job = createJob({ name, payload, runAt, cronExpression });
    res.status(201).json(publicJob(job));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }

});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  res.json(publicJob(job));
});

app.delete('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  schedules.get(job.id)?.stop();
  schedules.delete(job.id);
  jobs.delete(job.id);
  res.status(204).end();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => console.log(`Job Scheduler running at http://localhost:${PORT}`));