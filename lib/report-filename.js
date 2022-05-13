import moment from 'moment';
import EmberCliStringUtils from 'ember-cli-string-utils';
import * as Queries from '../queries/index.js'; /* eslint-disable-line no-unused-vars */ // typing

// report type names are the same as those of the frontend
// frontend see translations.json > keys "publication-reports--type--..."
const REPORT_TYPE_NAMES = {
  'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-mandatees-on-decision-date':
    'Publicaties per minister voor beslissingsdatum',
  'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-government-domains':
    'Publicaties per beleidsdomein',
  'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-mandatees-only-bvr':
    'Publicaties van BVRs per minister',
  'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-regulation-type-only-not-via-council-of-ministers':
    'Publicaties per type regelgeving buiten Ministerraad',
  'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-regulation-type':
    'Publicaties per type regelgeving',
  'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-mandatees-only-decree':
    'Publicaties van decreten per minister',
};

/** @param {Queries.Jobs.Job} jobRecord */
export function generate(jobRecord) {
  let reportNameDatePrefix = moment(jobRecord.createdTime).format(
    'YYYYMMDDHHmmss'
  );
  let reportNameType = REPORT_TYPE_NAMES[jobRecord.reportTypeUri];
  if (!reportNameType) {
    throw new Error(
      `no filename configure for report type <${jobRecord.reportTypeUri}>`
    );
  }
  reportNameType = EmberCliStringUtils.dasherize(reportNameType);

  let reportFilename = `${reportNameDatePrefix}-${reportNameType}`;
  return reportFilename;
}
