import moment from 'moment';
import EmberCliStringUtils from 'ember-cli-string-utils';
import * as Mu from 'mu';
import * as Queries from '../queries/index.js'; /* eslint-disable-line no-unused-vars */ // typing
import * as QueryUtils from '../queries/utils.js';

async function setup() {
  let sparql = Queries.ReportTypes.buildGet();
  let results = await Mu.query(sparql);
  let reportTypeRecords = QueryUtils.sparqlParseRecords(results);
  return reportTypeRecords;
}
const reportTypeRecordsPromise = setup();

/** @param {Queries.Jobs.Job} jobRecord */
export async function generate(jobRecord) {
  let reportNameDatePrefix = moment(jobRecord.createdTime).format(
    'YYYYMMDDHHmmss'
  );
  let reportTypeRecords = await reportTypeRecordsPromise;
  let reportTypeRecord = reportTypeRecords.find(
    (reportTypeRecord) => reportTypeRecord.uri === jobRecord.reportTypeUri
  );
  if (!reportTypeRecord) {
    throw new Error(
      `No filename has been configured for report type <${jobRecord.reportTypeUri}>.`
    );
  }
  let reportNameType = EmberCliStringUtils.dasherize(reportTypeRecord.label);

  let reportFilename = `${reportNameDatePrefix}-${reportNameType}`;
  return reportFilename;
}
