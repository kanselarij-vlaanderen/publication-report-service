import path from 'path';
import mu from 'mu';
import MuAuthSudo from '@lblod/mu-auth-sudo';
import * as config from './config.js';
import * as Delta from './lib/delta.js';
import * as VirtuosoClient from './lib/VirtuosoClient.js';
import * as RegulationType from './queries/reports/RegulationType.js';
import * as JobQueries from './queries/jobs.js';
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

  for (let jobUri of newJobUris) {
    let startTime = new Date();
    console.info(`Job <${jobUri}>: start`);
    let queryStart = JobQueries.updateStatusToRunning(jobUri, startTime);
    await MuAuthSudo.querySudo(queryStart);

    let endTime = new Date();
    console.info(`Job <${jobUri}>: success`);
    let queryEnd = JobQueries.updateStatusToSuccess(jobUri, endTime);
    await MuAuthSudo.querySudo(queryEnd);
  }

});

mu.app.use(mu.errorHandler);
