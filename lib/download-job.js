import { queryCsv } from './query-csv.js';
import * as MuFiles from './mu-files.js';
import * as JobParams from './job-params.js';
import * as ReportFilename from './report-filename.js';
import * as Queries from '../queries/index.js';

/** @param {Queries.Jobs.Job} jobRecord */
export async function run(jobRecord) {
  let jobParams = JobParams.parse(jobRecord.config);

  let sparqlParams = jobParams.query;
  let sparqlQuery = Queries.Reports.build(sparqlParams);
  console.log('Queried CSV: ' + sparqlQuery);
  let csvString = await queryCsv(sparqlQuery);

  let filename = await ReportFilename.generate(jobRecord);
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
