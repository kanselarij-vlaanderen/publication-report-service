import mu from 'mu';
import * as VirtuosoClient from './lib/VirtuosoClient.js';
import * as RegulationType from './queries/reports/RegulationType.js';

const client = VirtuosoClient.create({
  sparqlEndpointUrl: process.env.VIRTUOSO_SPARQL_ENDPOINT,
});

mu.app.get('/', async function (req, res, next) {
  try {
    const query = await RegulationType.query();
    await client.downloadToCsv(
      query,
      `/app/data/test${new Date().toISOString().slice(0, 10)}.csv`
    );
    res.send(JSON.stringify({ status: 'OK' }));
  } catch (err) {
    next(err, req, res, next);
  }
});

mu.app.use(mu.errorHandler);
