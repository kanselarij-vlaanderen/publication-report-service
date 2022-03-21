import mu from 'mu';
import * as SparqlDownloadClient from './lib/SparqlDownloadClient.js';
import * as RegulationType from './queries/reports/RegulationType.js';

mu.app.get('/', async function (req, res, next) {
  try {
    const query = await RegulationType.query();
    await SparqlDownloadClient.toCsv(
      query,
      `/app/data/test${new Date().toISOString().slice(0, 10)}.csv`
    );
    res.send(JSON.stringify({ status: 'OK' }));
  } catch (err) {
    next(err, req, res, next);
  }
});

mu.app.use(mu.errorHandler);
