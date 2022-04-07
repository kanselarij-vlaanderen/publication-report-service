import fetch from 'node-fetch';
import * as Fs from 'fs';
import * as Stream from 'stream';
import * as Util from 'util';

export async function downloadCsv(virtuosoSparqlEndpoint, query, downloadPath) {
  // - mu-authorization does not support Virtuoso's format=csv option
  // - node-sparql-client module does not allow non-json formats
  let urlBuilder = new URL(virtuosoSparqlEndpoint);
  urlBuilder.searchParams.append('query', query);
  urlBuilder.searchParams.append('format', 'csv');
  let response = await fetch(urlBuilder, {
    method: 'POST',
  });

  if (response.status >= 300) {
    let message = await response.text();
    throw new Error(message);
  }

  let pipeline = Util.promisify(Stream.pipeline);
  await pipeline(response.body, Fs.createWriteStream(downloadPath));
}
