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

  let jobExecutionPromise;
  try {
    jobExecutionPromise = job.run(jobRecord.config);
    let handleStartPromise = handleStart();
    let [jobResultUri] = await Promise.all([
      jobExecutionPromise,
      handleStartPromise,
    ]);
    await handleSuccess(jobResultUri);
  } catch (err) {
    await handleFail(err);
  }

  async function handleStart() {
    let startTime = new Date();
    console.info(`[${formatTime(startTime)}] Job <${jobUri}>: start`);
    let queryStart = Queries.Jobs.updateStatusToRunning(jobUri, startTime);
    await Sparql.update(queryStart, true);
  }

  async function handleSuccess(jobResultUri) {
    let endTime = new Date();
    console.info(`[${formatTime(endTime)}] Job <${jobUri}>: success`);
    let successQuery = Queries.Jobs.updateStatusToSuccess(
      jobUri,
      endTime,
      jobResultUri
    );
    await Sparql.update(successQuery, true);
  }

  async function handleFail(err) {
    let endTime = new Date();
    console.error(`[${formatTime(endTime)}] Job <${jobUri}>: error`, err);
    let failQuery = Queries.Jobs.updateStatusToFail(jobUri, endTime);
    await Sparql.update(failQuery, true);
  }
}
