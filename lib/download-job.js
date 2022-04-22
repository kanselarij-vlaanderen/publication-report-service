import { queryCsv } from './query-csv.js';
import * as MuFiles from './mu-files';
import * as JsonSchema from './json-schema.js';
import * as Queries from '../queries/index.js';

export async function run(jobConfigJSON) {
  let jobParams = JsonSchema.parse(jobConfigJSON);

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
