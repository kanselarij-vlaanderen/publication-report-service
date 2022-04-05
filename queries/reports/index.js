import * as GovernmentDomain from './government-domain.js';
import * as Mandatee from './mandatee.js';
import * as RegulationType from './regulation-type';

export function build(params) {
  let sparqlQuery;
  if (params.group === 'government-domain') {
    sparqlQuery = GovernmentDomain.build(params);
  } else if (params.group === 'mandatee') {
    sparqlQuery = Mandatee.build(params);
  } else if (params.group === 'regulation-type') {
    sparqlQuery = RegulationType.build(params);
  }
  return sparqlQuery;
}
