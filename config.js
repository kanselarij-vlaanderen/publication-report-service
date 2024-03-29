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

export const GRAPH = `http://mu.semte.ch/graphs/organizations/kanselarij`;

export const LOG_SPARQL_QUERIES =
  process.env.LOG_SPARQL_QUERIES != undefined
    ? env.get('LOG_SPARQL_QUERIES').asBool()
    : env.get('LOG_SPARQL_ALL').asBool();
