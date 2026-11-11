/**
Ugly workaround ahead!

We can't import ajv 8 at this point because the template has ajv v6 through its dependency chain.  We want to run the
code below:

import Ajv from 'ajv';
let ajv = new Ajv();
import addFormats from 'ajv-formats/dist/formats.js';

In order to run this with the new template, we have loaded AJV v8 under the name 'ajv-v8'.  We then register only the
necessary functions from ajv-formats because the larger function runs against an ajv import of its own if we understand
correctly.  The upside isthat we only register the functions we need.

Lines which are impacted by this have been postfixed with-ajv-v8 workaround;
 */
import Ajv from 'ajv-v8'; // ajv-v8-workaround
import { fullFormats } from 'ajv-formats/dist/formats.js'; // ajv-v8-workaround
import ParameterSchema from '../parameter-schema.js';

let ajv = new Ajv();
for (const format of ['date-time', 'uri']) { // ajv-v8-workaround
  ajv.addFormat(format, fullFormats[format]); // ajv-v8-workaround
} // ajv-v8-workaround
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
