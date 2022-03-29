import Path from 'path';
import Mu from 'mu';
import MuAuthSudo from '@lblod/mu-auth-sudo';
import * as Config from '../config.js';
import * as VirtuosoClient from './virtuoso-client.js';
import * as Queries from '../queries';

const client = VirtuosoClient.create({
  sparqlEndpointUrl: Config.VIRTUOSO_SPARQL_ENDPOINT,
});

export async function run(jobUri) {
  let jobQuery = Queries.Jobs.buildGet(jobUri);
  let result = await MuAuthSudo.querySudo(jobQuery);
  let jobRecord = Queries.Jobs.parseGet(result);

  let jobExecutionPromise;
  try {
    jobExecutionPromise = executeDownload(jobRecord);
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

async function executeDownload(job) {
  let query, reportFilePath;
  if (job.config.group === 'government-domain') {
    query = Queries.Reports.GovernmentDomain.build();
  } else if (job.config.group === 'mandatee') {
    query = Queries.Reports.Mandatee.build();
  } else if (job.config.group === 'regulation-type') {
    query = Queries.Reports.RegulationType.build();
  }

  let reportFileName = Mu.uuid() + '.csv';
  reportFilePath = Path.join(Config.STORAGE_PATH, reportFileName);

  await client.downloadToCsv(query, reportFilePath);
}
