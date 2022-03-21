import fetch from 'node-fetch';
import * as fs from 'fs';
import * as stream from 'stream';
import * as util from 'util';

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
  let response = await fetch(urlBuilder, {
    method: 'POST',
  });

  if (response.status >= 300) {
    const message = await response.text();
    throw new Error(message);
  }

  const pipeline = util.promisify(stream.pipeline);
  await pipeline(response.body, fs.createWriteStream(downloadPath));
}
