import Mu from 'mu';
import * as DownloadJob from './lib/download-job.js';
import * as Delta from './lib/delta.js';
import bodyParser from 'body-parser';

Mu.app.post('/delta', bodyParser.json(), async function (req, res) {
  res.status(202).end();

  let deltas = req.body;
  let newJobUris = Delta.filterInsertedJobUris(deltas);

  console.log('I received jobs with URIs: ', newJobUris.join(' '));

  for (let jobUri of newJobUris) {
    DownloadJob.run(jobUri);
  }

});

Mu.app.use(Mu.errorHandler);
