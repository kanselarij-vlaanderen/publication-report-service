import * as Express from 'express';
import Mu from 'mu';
import * as JobRunner from './lib/job-runner.js';
import * as DownloadJob from './lib/download-job.js';
import * as Delta from './lib/delta.js';

Mu.app.post('/delta', Express.json(), async function (req, res) {
  res.sendStatus(202);

  let deltas = req.body;
  let newJobUris = Delta.filterInsertedJobUris(deltas);

  for (let jobUri of newJobUris) {
    JobRunner.run(jobUri, DownloadJob);
  }
});
