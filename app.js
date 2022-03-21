import path from 'path';
import mu from 'mu';
import * as config from './config.js';
import * as VirtuosoClient from './lib/VirtuosoClient.js';
import * as RegulationType from './queries/reports/RegulationType.js';

const client = VirtuosoClient.create({
  sparqlEndpointUrl: config.VIRTUOSO_SPARQL_ENDPOINT,
});

mu.app.get('/', async function (req, res, next) {
  try {
    const query = await RegulationType.query();

    const reportFileName = mu.uuid() + '.csv';
    const reportFilePath = path.join(config.STORAGE_PATH, reportFileName);

    await client.downloadToCsv(query, reportFilePath);
    res.send(JSON.stringify({ status: 'OK' }));
  } catch (err) {
    next(err, req, res, next);
  }
});

mu.app.use(mu.errorHandler);
