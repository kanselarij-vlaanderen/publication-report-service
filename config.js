import env from 'env-var';

export const { VIRTUOSO_SPARQL_ENDPOINT } = process.env;
if (!VIRTUOSO_SPARQL_ENDPOINT) {
  throw new Error('missing environment variable: VIRTUOSO_SPARQL_ENDPOINT');
}

export const STORAGE_PATH = process.env.STORAGE_PATH ?? `/share`;

export const RESOURCE_URI_BASE = `http://mu.semte.ch/services/publication-report-service/`;
export function buildResourceUri(typePlural, uuid) {
  return RESOURCE_URI_BASE + typePlural + '/' + uuid;
}
export const GRAPHS = {
  KANSELARIJ: `http://mu.semte.ch/graphs/organizations/kanselarij`,
  PUBLIC: `http://mu.semte.ch/graphs/public`,
  STAATSBLAD: `http://mu.semte.ch/graphs/staatsblad`,
}

export const STATUS_PUBLISHED = 'http://themis.vlaanderen.be/id/concept/publicatie-status/2f8dc814-bd91-4bcf-a823-baf1cdc42475';
export const CONCEPT_SCHEME_GOV_DOMAIN = 'http://themis.vlaanderen.be/id/concept-scheme/f4981a92-8639-4da4-b1e3-0e1371feaa81';

export const JOB = {
  STATUSES: {
    SCHEDULED: 'http://redpencil.data.gift/id/concept/JobStatus/scheduled',
    BUSY: 'http://redpencil.data.gift/id/concept/JobStatus/busy',
    SUCCESS: 'http://redpencil.data.gift/id/concept/JobStatus/success',
    FAILED: 'http://redpencil.data.gift/id/concept/JobStatus/failed',
  },
  RDF_TYPE: 'http://mu.semte.ch/vocabularies/ext/publicatie/PublicationMetricsExportJob',
  JSONAPI_JOB_TYPE: 'file-bundling-jobs',
};

export const LOG_SPARQL_QUERIES =
  process.env.LOG_SPARQL_QUERIES != undefined
    ? env.get('LOG_SPARQL_QUERIES').asBool()
    : env.get('LOG_SPARQL_ALL').asBool();
