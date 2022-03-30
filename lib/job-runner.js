import Path from 'path';
import Fs from 'fs';
import Mu from 'mu';
import MuAuthSudo from '@lblod/mu-auth-sudo';
import * as Sparql from './sparql.js';
import * as Config from '../config.js';
import * as VirtuosoClient from './virtuoso-client.js';
import * as Queries from '../queries';

export const Status = {
  RUNNING: 'http://vocab.deri.ie/cogs#Running',
  SUCCESS: 'http://vocab.deri.ie/cogs#Success',
  FAIL: 'http://vocab.deri.ie/cogs#Fail',
};

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
  let queryObject = job.config.query;

  let sparqlQuery;
  if (queryObject.group === 'government-domain') {
    sparqlQuery = Queries.Reports.GovernmentDomain.build();
  } else if (queryObject.group === 'mandatee') {
    sparqlQuery = Queries.Reports.Mandatee.build();
  } else if (queryObject.group === 'regulation-type') {
    sparqlQuery = Queries.Reports.RegulationType.build();
  }

  let filename = job.config.name;
  let extension = 'csv';
  let basename = filename + '.' + extension;
  let filePath = Path.join(Config.STORAGE_PATH, basename);

  await client.downloadToCsv(sparqlQuery, filePath);

  let fileUuid = Mu.uuid();
  let fileUri = Config.buildResourceUri('files', fileUuid);
  let fileStats = await Fs.promises.stat(filePath);
  /** @type {Queries.File.FileRecord} */
  let fileRecord = {
    uri: fileUri,
    uuid: fileUuid,
    path: filePath,
    name: basename,
    extension: extension,
    format:
      'text/csv' /** @see https://stackoverflow.com/questions/7076042/what-mime-type-should-i-use-for-csv */,
    size: fileStats.size,
    created: fileStats.birthtime,
  };

  let physicalFileUuid = Mu.uuid();
  let physicalFileName = physicalFileUuid + '.' + extension;
  let physicalFileUri = `share://` + basename;
  /** @type {Queries.File.PhysicalFileRecord} */
  let physicalFileRecord = {
    uri: physicalFileUri,
    uuid: physicalFileUuid,
    name: physicalFileName,
  };

  let fileInsertQuery = Queries.File.create(fileRecord, physicalFileRecord);

  // TODO figure out whether mu-semte-ch approved
  await Sparql.update(fileInsertQuery);
  // await MuAuthSudo.updateSudo(fileInsertQuery);
}
