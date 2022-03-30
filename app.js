import Mu from 'mu';
import * as JobRunner from './lib/job-runner.js';
import * as DownloadJob from './lib/download-job.js';
import * as Delta from './lib/delta.js';
import bodyParser from 'body-parser';

Mu.app.post('/delta', bodyParser.json(), async function (req, res) {
  res.status(202).end();

  let deltas = req.body;
  let newJobUris = Delta.filterInsertedJobUris(deltas);

  for (let jobUri of newJobUris) {
    JobRunner.run(jobUri, DownloadJob);
  }
});
