export const { VIRTUOSO_SPARQL_ENDPOINT } = process.env;
if (!VIRTUOSO_SPARQL_ENDPOINT) {
  throw new Error('missing environment variable: VIRTUOSO_SPARQL_ENDPOINT');
}

export const STORAGE_PATH = `/share`;
