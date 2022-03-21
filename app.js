import mu from 'mu';
import * as RegulationType from './queries/reports/RegulationType.js';

mu.app.get('/', async function (req, res, next) {
  try {
    const q = await RegulationType.query();
    res.send(JSON.stringify(await mu.query(q)));
  } catch (err) {
    next(err, req, res, next);
  }
});

mu.app.use(mu.errorHandler);
