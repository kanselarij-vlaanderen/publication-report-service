import { app, errorHandler } from 'mu';
import bodyParser from 'body-parser';
import * as JobRunner from './lib/job-runner.js';
import * as DownloadJob from './lib/download-job.js';
import * as Delta from './lib/delta.js';

/**
 * application architecture:
 * 1. frontend saves a PublicationMetricsExportJob in the database
 * 2. delta-notifier sends a notification to this service
 * 3. publication-report-service comes in action:
 *    flow: (based on the file-bundling-service @see https://github.com/kanselarij-vlaanderen/file-bundling-service)
 *    1. /delta endpoint picks up notification @see file://./lib/delta.js
 *    2. JobRunner sets status to Busy and runs DownloadJob @see file://./lib/job-runner.js
 *    3. DownloadJob runs @see file://./lib/download-job.js
 *      1. parse job parameters @see file://./job-params.js
 *      2. build report query @see file://./queries/reports/index.js
 *      3. request Virtuoso in order generate csv @see file://./lib/query-csv.js
 *      4. save the file and database record @see file://./lib/mu-files.js
 *    4. JobRunner sets status to Success/Fail
 * 4. when frontend notices the job has finished, it shows the download link
 */

// in order to interpret the dates (parsed from in .toJSON() format (=.toISOString())) in the same timezone as the frontend
if (!process.env.TZ) {
  process.env.TZ = 'Europe/Brussels';
}

app.post('/delta', bodyParser.json(), async (req, res) => {
  res.sendStatus(202);

  const deltas = req.body;
  const newJobUris = Delta.filterInsertedJobUris(deltas);

  for (const jobUri of newJobUris) {
    JobRunner.run(jobUri, DownloadJob);
  }
});

app.use(errorHandler);
