// eslint-disable-next-line no-unused-vars
import { querySudo, updateSudo } from '@lblod/mu-auth-sudo';
import * as Queries from '../queries';

export const JobStatus = {
  RUNNING: 'http://vocab.deri.ie/cogs#Running',
  SUCCESS: 'http://vocab.deri.ie/cogs#Success',
  FAIL: 'http://vocab.deri.ie/cogs#Fail',
};

export async function run(jobUri, job) {
  try {
    let jobQuery = Queries.Jobs.buildGet(jobUri);
    let result = await querySudo(jobQuery);
    let jobRecord = Queries.Jobs.parseGet(result);

    await handleStart();
    let jobResultUri = await job.run(jobRecord.config);
    await handleSuccess(jobResultUri);
  } catch (err) {
    await handleError(err);
  }

  async function handleStart() {
    let time = new Date();
    console.info(`Job <${jobUri}>: start`);
    let queryStart = Queries.Jobs.updateStatusToRunning(jobUri, time);
    await updateSudo(queryStart);
  }

  async function handleSuccess(jobResultUri) {
    let time = new Date();
    console.info(`Job <${jobUri}>: success`);
    let successQuery = Queries.Jobs.updateStatusToSuccess(
      jobUri,
      time,
      jobResultUri
    );
    await updateSudo(successQuery);
  }

  async function handleError(err) {
    let time = new Date();
    console.error(`Job <${jobUri}>: error`, err);
    let failQuery = Queries.Jobs.updateStatusToError(jobUri, time);
    await updateSudo(failQuery, true);
  }
}
