import * as Express from 'express';
import Mu from 'mu';
import * as JobRunner from './lib/job-runner.js';
import * as DownloadJob from './lib/download-job.js';
import * as Delta from './lib/delta.js';

/**
 * /// TOREVIEW:
 * in order to interpret the dates (parsed from in .toJSON() format (=.toISOString())) in the same timezone as the frontend
 *  node.js allows setting the timezone
 *
 * alternatives:
 * configure docker:
 * a timezone file for the docker container and mount it to /etc/timezone
 * @see {https://serverfault.com/questions/683605/docker-container-time-timezone-will-not-reflect-changes#}
 */
if (!process.env.TZ) {
  process.env.TZ = 'Europe/Brussels';
}

Mu.app.post('/delta', Express.json(), async function (req, res) {
  res.sendStatus(202);

  let deltas = req.body;
  let newJobUris = Delta.filterInsertedJobUris(deltas);

  for (let jobUri of newJobUris) {
    JobRunner.run(jobUri, DownloadJob);
  }
});
