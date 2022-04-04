import Path from 'path';
import Fs from 'fs';
import Mu from 'mu';
import * as Sparql from './sparql.js';
import * as Config from '../config.js';
import * as VirtuosoClient from './virtuoso-client.js';
import * as Queries from '../queries';

const client = VirtuosoClient.create({
  sparqlEndpointUrl: Config.VIRTUOSO_SPARQL_ENDPOINT,
});

export async function run(config) {
  let queryObject = config.query;

  let sparqlQuery;
  if (queryObject.group === 'government-domain') {
    sparqlQuery = Queries.Reports.GovernmentDomain.build();
  } else if (queryObject.group === 'mandatee') {
    sparqlQuery = Queries.Reports.Mandatee.build();
  } else if (queryObject.group === 'regulation-type') {
    sparqlQuery = Queries.Reports.RegulationType.build();
  }

  let filename = config.name;
  let extension = 'csv';
  let basename = filename + '.' + extension;
  let filePath = Path.join(Config.STORAGE_PATH, basename);

  await client.downloadCsv(sparqlQuery, filePath);

  let fileUuid = Mu.uuid();
  let fileUri = Config.buildResourceUri('files', fileUuid);
  let fileStats = await Fs.promises.stat(filePath);
  /** @type {Queries.File.FileRecord} */
  let fileRecord = {
    uri: fileUri,
    uuid: fileUuid,
    path: filePath,
    name: basename,
    extension: extension,
    format:
      'text/csv' /** @see https://stackoverflow.com/questions/7076042/what-mime-type-should-i-use-for-csv */,
    size: fileStats.size,
    createdTime: fileStats.birthtime,
  };

  let physicalFileUuid = Mu.uuid();
  let physicalFileName = physicalFileUuid + '.' + extension;
  let physicalFileUri = `share://` + basename;
  /** @type {Queries.File.PhysicalFileRecord} */
  let physicalFileRecord = {
    uri: physicalFileUri,
    uuid: physicalFileUuid,
    name: physicalFileName,
  };

  let fileInsertQuery = Queries.File.create(fileRecord, physicalFileRecord);

  // TODO figure out whether mu-semte-ch approved
  await Sparql.update(fileInsertQuery);
  // await MuAuthSudo.updateSudo(fileInsertQuery);
}
