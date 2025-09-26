import * as Queries from '../queries';
import { JOB } from '../config';

export async function run(jobUri, job) {
  let jobRecord;
  try {
    const result = await Queries.Jobs.findJob(jobUri);
    [jobRecord] = Queries.Jobs.parseGet(result);
    if (!jobRecord.reportTypeUri) {
      throw new Error(
        `Job <${jobUri}> not yet linked to a pub:Publicationrapporttype`
      );
    }
  } catch (err) {
    console.error(`Job <${jobUri}>: error`, err);
    await handleError(err);
    return;
  }

  try {
    await handleStart();
    const jobResultUri = await job.run(jobRecord);
    await handleSuccess(jobResultUri);
  } catch (err) {
    await handleError(err);
   return 
  }

  async function handleStart() {
    console.info(`Job <${jobUri}>: start`);
    await Queries.Jobs.updateJobStatus(jobUri, JOB.STATUSES.BUSY);
  }

  async function handleSuccess(jobResultUri) {
    console.info(`Job <${jobUri}>: success`);
    await Queries.Jobs.attachResultToJob(jobUri, jobResultUri);
    await Queries.Jobs.updateJobStatus(jobUri, JOB.STATUSES.SUCCESS);
  }

  async function handleError(err) {
    console.error(`Job <${jobUri}>: error`, err?.message);
    console.trace(err);
    await Queries.Jobs.updateJobStatus(jobUri, JOB.STATUSES.FAILED, err?.message);
  }
}
