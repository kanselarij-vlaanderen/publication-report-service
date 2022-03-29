import Path from 'path';
import Mu from 'mu';
import MuAuthSudo from '@lblod/mu-auth-sudo';
import * as Config from './config.js';
import * as Utils from './lib/utils.js';
import * as Delta from './lib/delta.js';
import * as VirtuosoClient from './lib/VirtuosoClient.js';
import * as RegulationType from './queries/reports/RegulationType.js';
import * as JobQueries from './queries/jobs.js';
import bodyParser from 'body-parser';

const client = VirtuosoClient.create({
  sparqlEndpointUrl: Config.VIRTUOSO_SPARQL_ENDPOINT,
});

Mu.app.get('/', async function (req, res, next) {
  try {
    let query = await RegulationType.query();

    let reportFileName = Mu.uuid() + '.csv';
    let reportFilePath = Path.join(Config.STORAGE_PATH, reportFileName);

    await client.downloadToCsv(query, reportFilePath);
    res.send(JSON.stringify({ status: 'OK' }));
  } catch (err) {
    next(err, req, res, next);
  }
});

Mu.app.post('/delta', bodyParser.json(), async function (req, res) {
  res.status(202).end();

  let deltas = req.body;
  let newJobUris = Delta.filterInsertedJobUris(deltas);

  console.log('I received jobs with URIs: ', newJobUris.join(' '));

  for (let jobUri of newJobUris) {
    let jobQuery = JobQueries.get(jobUri);
    let result = await MuAuthSudo.querySudo(jobQuery);
    console.log(Utils.parseSparqlResults(result));

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

Mu.app.use(Mu.errorHandler);
