import Ajv from 'ajv';
import ajvAddFormats from 'ajv-formats';
import ParameterSchema from '../parameter-schema.js';

let ajv = new Ajv();
ajvAddFormats(ajv);
let validate = ajv.compile(ParameterSchema);

export function parse(jobParamsJSON) {
  let jobParams = JSON.parse(jobParamsJSON);
  let isValid = validate(jobParams);
  let errors = validate.errors;
  if (!isValid) {
    throw errors;
  }
  return parseParams(jobParams);
}

/**
 * parse dates
 * normalize: null or undefined to undefined
 */
function parseParams(jobParams) {
  let filter = jobParams.query.filter || {};
  filter = {
    decisionDate: parseDateRangeParams(filter.decisionDate),
    publicationDate: parseDateRangeParams(filter.publicationDate),
    isViaCouncilOfMinisters: filter.isViaCouncilOfMinisters ?? undefined,
    regulationType: filter.regulationType ?? undefined,
    governmentDomains: filter.governmentDomains ?? undefined,
    mandateePersons: filter.mandateePersons ?? undefined,
  };
  jobParams.query.filter = filter;
  return jobParams;
}

function parseDateRangeParams(dateRange) {
  return (
    dateRange?.map((date) => (date ? new Date(date) : undefined)) ?? undefined
  );
}
