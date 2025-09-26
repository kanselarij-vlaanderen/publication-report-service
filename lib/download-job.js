import { queryCsv } from './query-csv.js';
import * as MuFiles from './mu-files.js';
import * as JobParams from './job-params.js';
import * as ReportFilename from './report-filename.js';
import * as Queries from '../queries/index.js';

/** @param {Queries.Jobs.Job} jobRecord */
export async function run(jobRecord) {
  const jobParams = JobParams.parse(jobRecord.config);

  const sparqlParams = jobParams.query;
  const sparqlQuery = Queries.Reports.build(sparqlParams);
  const csvString = await queryCsv(sparqlQuery);

  const filename = await ReportFilename.generate(jobRecord);
  const extension = 'csv';
  /** @see https://www.iana.org/assignments/media-types/media-types.xhtml */
  const mimeType = 'text/csv';
  const muFileRecord = await MuFiles.saveText(
    filename,
    extension,
    mimeType,
    csvString
  );

  return muFileRecord.records.user.uri;
}
