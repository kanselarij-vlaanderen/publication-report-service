import * as Sparql from './sparql.js';
import * as Config from '../config.js';
import * as VirtuosoClient from './virtuoso-client.js';
import * as MuFiles from './mu-files';
import * as Queries from '../queries/index.js';

export async function run(jobConfig) {
  let queryParams = jobConfig.query;
  let sparqlQuery = Queries.Reports.build(queryParams);

  let extension = 'csv';
  /** @see https://www.iana.org/assignments/media-types/media-types.xhtml */
  let mimeType = 'text/csv';
  let muFileRecord = MuFiles.createRecord(jobConfig.name, extension, mimeType);

  await VirtuosoClient.downloadCsv(
    Config.VIRTUOSO_SPARQL_ENDPOINT,
    sparqlQuery,
    muFileRecord.path
  );

  await MuFiles.updateRecordStats(muFileRecord);

  let fileInsertQuery = Queries.Files.create(
    muFileRecord.records.user,
    muFileRecord.records.storage
  );
  // TODO figure out whether mu-semte-ch approved
  await Sparql.update(fileInsertQuery, true);
  // await MuAuthSudo.updateSudo(fileInsertQuery);

  let jobResult = muFileRecord.records.user.uri;
  return jobResult;
}
