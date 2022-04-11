import { formatDate as formatTime } from './utils';
import * as Sparql from './sparql';
import * as Queries from '../queries';

export const JobStatus = {
  RUNNING: 'http://vocab.deri.ie/cogs#Running',
  SUCCESS: 'http://vocab.deri.ie/cogs#Success',
  FAIL: 'http://vocab.deri.ie/cogs#Fail',
};

export async function run(jobUri, job) {
  let jobQuery = Queries.Jobs.buildGet(jobUri);
  let result = await Sparql.query(jobQuery, true);
  let jobRecord = Queries.Jobs.parseGet(result);

  try {
    await handleStart();
    let jobResultUri = await job.run(jobRecord.config);
    await handleSuccess(jobResultUri);
  } catch (err) {
    await handleError(err);
  }

  async function handleStart() {
    let time = new Date();
    console.info(`[${formatTime(time)}] Job <${jobUri}>: start`);
    let queryStart = Queries.Jobs.updateStatusToRunning(jobUri, time);
    await Sparql.update(queryStart, true);
  }

  async function handleSuccess(jobResultUri) {
    let time = new Date();
    console.info(`[${formatTime(time)}] Job <${jobUri}>: success`);
    let successQuery = Queries.Jobs.updateStatusToSuccess(
      jobUri,
      time,
      jobResultUri
    );
    await Sparql.update(successQuery, true);
  }

  async function handleError(err) {
    let time = new Date();
    console.error(`[${formatTime(time)}] Job <${jobUri}>: error`, err);
    let failQuery = Queries.Jobs.updateStatusToError(jobUri, time);
    await Sparql.update(failQuery, true);
  }
}
