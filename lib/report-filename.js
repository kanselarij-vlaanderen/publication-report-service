import moment from 'moment';
import * as Queries from '../queries/index.js';
import * as QueryUtils from '../queries/utils.js';

export function dasherize(text) {
  return text.trim().replace(/\s/g, '-');
}

async function findReportTypes() {
  const results = await Queries.ReportTypes.findReportType();
  const reportTypeRecords = QueryUtils.sparqlParseRecords(results);
  return reportTypeRecords;
}

/** @param {Queries.Jobs.Job} jobRecord */
export async function generate(jobRecord) {
  const reportNameDatePrefix = moment(jobRecord.createdTime).format(
    'YYYYMMDDHHmmss'
  );
  const reportTypeRecords = await findReportTypes();
  const reportTypeRecord = reportTypeRecords.find(
    (reportTypeRecord) => reportTypeRecord.uri === jobRecord.reportTypeUri
  );
  if (!reportTypeRecord) {
    throw new Error(
      `No filename has been configured for report type <${jobRecord.reportTypeUri}>.`
    );
  }
  const reportNameType = dasherize(reportTypeRecord.label.toLowerCase());

  const reportFilename = `${reportNameDatePrefix}-${reportNameType}`;
  return reportFilename;
}
