import { queryCsv } from './query-csv.js';
import * as MuFiles from './mu-files.js';
import * as JobParams from './job-params.js';
import * as Queries from '../queries/index.js';

export async function run(jobParamsJSON) {
  let jobParams = JobParams.parse(jobParamsJSON);

  let queryParams = jobParams.query;
  let sparqlQuery = Queries.Reports.build(queryParams);
  let csvString = await queryCsv(sparqlQuery);

  let filename = jobParams.name;
  let extension = 'csv';
  /** @see https://www.iana.org/assignments/media-types/media-types.xhtml */
  let mimeType = 'text/csv';
  let muFileRecord = await MuFiles.saveText(
    filename,
    extension,
    mimeType,
    csvString
  );

  let jobResult = muFileRecord.records.user.uri;
  return jobResult;
}
