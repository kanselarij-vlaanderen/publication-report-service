import fetch, { Headers } from 'node-fetch';

export async function queryCsv(virtuosoSparqlEndpoint, query) {
  // directly call Virtuoso's /sparql endpoint:
  // - not using mu-authorization: does only support JSON results
  // - not using node-sparql-client: package does only support JSON results
  let urlBuilder = new URL(virtuosoSparqlEndpoint);
  let response = await fetch(urlBuilder, {
    method: 'POST',
    headers: new Headers({
      Accept: 'text/csv',
      'Content-Type': 'application/sparql-query',
    }),
    body: query,
  });

  if (!response.ok) {
    let message = await response.text();
    throw new Error(message);
  }

  let csvString = await response.text();
  return csvString;
}
