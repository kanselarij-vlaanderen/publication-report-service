import Ajv from 'ajv';
import addAjvFormats from 'ajv-formats';
import ParameterSchema from '../parameter-schema.js';

let ajv = new Ajv();
addAjvFormats(ajv);
let validate = ajv.compile(ParameterSchema);

export function parse(jobParamsJSON) {
  let jobParams = JSON.parse(jobParamsJSON);
  let isValid = validate(jobParams);
  if (!isValid) throw validate.errors;
  postProcessParsedJSONParams(jobParams);
  return jobParams;
}

/**
 * Post-process parsed JSON params:
 * - parse date strings to Date objects
 * - replace nulls to undefined
 *   in order to limit type checks
 */
function postProcessParsedJSONParams(jobParams) {
  let filter = jobParams.query.filter || {};
  filter.decisionDate = parseDateRangeParams(filter.decisionDate);
  filter.publicationDate = parseDateRangeParams(filter.publicationDate);
  filter.isViaCouncilOfMinisters = filter.isViaCouncilOfMinisters ?? undefined;
  filter.regulationType = filter.regulationType ?? undefined;
  filter.governmentDomains = filter.governmentDomains ?? undefined;
  filter.mandateePersons = filter.mandateePersons ?? undefined;
}

function parseDateRangeParams(dateRange) {
  return (
    dateRange?.map((date) => (date ? new Date(date) : undefined)) ?? undefined
  );
}
