import path from 'path';
import mu from 'mu';
import * as config from './config.js';
import * as Delta from './lib/delta.js';
import * as VirtuosoClient from './lib/VirtuosoClient.js';
import * as RegulationType from './queries/reports/RegulationType.js';
import bodyParser from 'body-parser';

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

mu.app.post('/delta', bodyParser.json(), async function (req, res) {
  res.status(202).end();

  let deltas = req.body;
  let newJobUris = Delta.filterInsertedJobUris(deltas);

  console.log('I received jobs with URIs: ', newJobUris.join(' '));
});

mu.app.use(mu.errorHandler);
