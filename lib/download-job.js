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

export async function run(jobConfig) {
  let queryParams = jobConfig.query;
  let sparqlQuery = Queries.Reports.build(queryParams);

  let extension = 'csv';
  // user filename: user friendly name
  let userFilename = sanitizeFilename(jobConfig.name);
  let userBasename = userFilename + '.' + extension;

  let fileUuid = Mu.uuid();
  let fileUri = Config.buildResourceUri('files', fileUuid);

  // storage filename: computer friendly name (uuid)
  let storageBasename = fileUuid + '.' + extension;
  let storageFilePath = Path.join(Config.STORAGE_PATH, storageBasename);

  await client.downloadCsv(sparqlQuery, storageFilePath);

  let fileStats = await Fs.promises.stat(storageFilePath);
  /** @type {Queries.Files.FileRecord} */
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
  /** @type {Queries.Files.PhysicalFileRecord} */
  let physicalFileRecord = {
    uri: physicalFileUri,
    uuid: physicalFileUuid,
    name: physicalFileName,
  };

  let fileInsertQuery = Queries.Files.create(fileRecord, physicalFileRecord);

  // TODO figure out whether mu-semte-ch approved
  await Sparql.update(fileInsertQuery, true);
  // await MuAuthSudo.updateSudo(fileInsertQuery);

  return fileUri;
}
