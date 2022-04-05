import Path from 'path';
import Fs from 'fs';
import Mu from 'mu';
import sanitizeFilename from 'sanitize-filename';
import * as Sparql from './sparql.js';
import * as Config from '../config.js';
import * as VirtuosoClient from './virtuoso-client.js';
import * as Queries from '../queries/index.js';

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

  let extension = 'csv';
  // user filename: user friendly name
  let userFilename = sanitizeFilename(config.name);
  let userBasename = userFilename + '.' + extension;

  let fileUuid = Mu.uuid();
  let fileUri = Config.buildResourceUri('files', fileUuid);

  // storage filename: computer friendly name (uuid)
  let storageBasename = fileUuid + '.' + extension;
  let storageFilePath = Path.join(Config.STORAGE_PATH, storageBasename);

  await client.downloadCsv(sparqlQuery, storageFilePath);

  let fileStats = await Fs.promises.stat(storageFilePath);
  /** @type {Queries.File.FileRecord} */
  let fileRecord = {
    uri: fileUri,
    uuid: fileUuid,
    name: userBasename,
    extension: extension,
    format:
      'text/csv' /** @see https://stackoverflow.com/questions/7076042/what-mime-type-should-i-use-for-csv */,
    size: fileStats.size,
    createdTime: fileStats.birthtime,
  };

  let physicalFileUri = global.encodeURI(`share://` + storageBasename);
  let physicalFileUuid = Mu.uuid();
  let physicalFileName = physicalFileUuid + '.' + extension;
  /** @type {Queries.File.PhysicalFileRecord} */
  let physicalFileRecord = {
    uri: physicalFileUri,
    uuid: physicalFileUuid,
    name: physicalFileName,
  };

  let fileInsertQuery = Queries.File.create(fileRecord, physicalFileRecord);

  // TODO figure out whether mu-semte-ch approved
  await Sparql.update(fileInsertQuery, true);
  // await MuAuthSudo.updateSudo(fileInsertQuery);

  return fileUri;
}
