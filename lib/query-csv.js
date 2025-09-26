import fetch, { Headers } from 'node-fetch';
import * as Config from '../config.js';

export async function queryCsv(
  query,
  virtuosoSparqlEndpoint = Config.VIRTUOSO_SPARQL_ENDPOINT
) {
  if (Config.LOG_SPARQL_QUERIES) {
    console.log('Query CSV from triplestore:', query);
  }

  // directly call Virtuoso's /sparql endpoint:
  // - not using mu-authorization: does only support JSON results
  // - not using node-sparql-client: package does only support JSON results
  const urlBuilder = new URL(virtuosoSparqlEndpoint);
  const response = await fetch(urlBuilder, {
    method: 'POST',
    headers: new Headers({
      Accept: 'text/csv',
      'Content-Type': 'application/sparql-query',
    }),
    body: query,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message);
  }

  const csvString = await response.text();
  return csvString;
}
