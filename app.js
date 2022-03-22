import path from 'path';
import mu from 'mu';
import * as config from './config.js';
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

mu.app.post('/delta', bodyParser.json(), async function (req, res, next) {
  res.status(202).end();

  let deltas = req.body;
  let newJobUris = [];
  for (let delta of deltas) {
    let inserts = delta.inserts;
    for (let triple of inserts) {
      let isJob =
        triple.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
        triple.object.value === 'http://mu.semte.ch/vocabularies/ext/publicatie/PublicationMetricsExportJob';

      if (isJob) {
        let jobUri = triple.subject.value;
        newJobUris.push(jobUri);
      }
    }
  }

  console.log("I received jobs with URI: ", newJobUris.join(' '))
});

mu.app.use(mu.errorHandler);
