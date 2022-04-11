import fetch, { Headers } from 'node-fetch';
import * as Fs from 'fs';
import * as Stream from 'stream';
import * as Util from 'util';

export async function downloadCsv(virtuosoSparqlEndpoint, query, downloadPath) {
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

  if (response.ok) {
    let message = await response.text();
    throw new Error(message);
  }

  let pipeline = Util.promisify(Stream.pipeline);
  await pipeline(response.body, Fs.createWriteStream(downloadPath));
}
