import fetch from 'node-fetch';
import * as Fs from 'fs';
import * as Stream from 'stream';
import * as Util from 'util';

/**
 * @param {{ sparqlEndpointUrl: string }} params
 */
export function create(params) {
  return {
    downloadToCsv: (query, downloadPath) =>
      downloadToCsv(params.sparqlEndpointUrl, query, downloadPath),
  };
}

export async function downloadToCsv(sparqlEndpointUrl, query, downloadPath) {
  // - mu-authorization does not support Virtuoso's format=csv option
  // - node-sparql-client module does not allow non-json formats
  const urlBuilder = new URL(sparqlEndpointUrl);
  urlBuilder.searchParams.append('query', query);
  urlBuilder.searchParams.append('format', 'csv');
  const response = await fetch(urlBuilder, {
    method: 'POST',
  });

  if (response.status >= 300) {
    const message = await response.text();
    throw new Error(message);
  }

  const pipeline = Util.promisify(Stream.pipeline);
  await pipeline(response.body, Fs.createWriteStream(downloadPath));
}
