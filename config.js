export const { VIRTUOSO_SPARQL_ENDPOINT } = process.env;
if (!VIRTUOSO_SPARQL_ENDPOINT) {
  throw new Error('missing environment variable: VIRTUOSO_SPARQL_ENDPOINT');
}

export const STORAGE_PATH = process.env.STORAGE_PATH ?? `/share`;

export const RESOURCE_URI_BASE = `http://mu.semte.ch/services/file-bundling-service/`;
export function buildResourceUri(typePlural, uuid) {
  return RESOURCE_URI_BASE + typePlural + '/' + uuid;
}

export const GRAPH = `http://mu.semte.ch/graphs/organizations/kanselarij`;
