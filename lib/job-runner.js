import MuAuthSudo from '@lblod/mu-auth-sudo';
import * as Queries from '../queries';

export const JobStatus = {
  RUNNING: 'http://vocab.deri.ie/cogs#Running',
  SUCCESS: 'http://vocab.deri.ie/cogs#Success',
  FAIL: 'http://vocab.deri.ie/cogs#Fail',
};

export async function run(jobUri, job) {
  let jobQuery = Queries.Jobs.buildGet(jobUri);
  let result = await MuAuthSudo.querySudo(jobQuery);
  let jobRecord = Queries.Jobs.parseGet(result);

  let jobExecutionPromise;
  try {
    jobExecutionPromise = job.run(jobRecord.config);
    let handleStartPromise = handleStart();
    await Promise.all([jobExecutionPromise, handleStartPromise]);
    await handleSuccess();
  } catch (err) {
    await handleFail(err);
  }

  async function handleStart() {
    let startTime = new Date();
    console.info(`Job <${jobUri}>: start`);
    let queryStart = Queries.Jobs.updateStatusToRunning(jobUri, startTime);
    await MuAuthSudo.querySudo(queryStart);
  }

  async function handleSuccess() {
    let endTime = new Date();
    console.info(`Job <${jobUri}>: success`);
    let successQuery = Queries.Jobs.updateStatusToSuccess(jobUri, endTime);
    await MuAuthSudo.querySudo(successQuery);
  }

  async function handleFail(err) {
    let endTime = new Date();
    console.error(`Job <${jobUri}>: error`, err);
    let failQuery = Queries.Jobs.updateStatusToFail(jobUri, endTime);
    await MuAuthSudo.querySudo(failQuery);
  }
}
