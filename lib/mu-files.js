// eslint-disable-next-line no-unused-vars
import { querySudo, updateSudo } from '@lblod/mu-auth-sudo';
import Path from 'path';
import Fs from 'fs';
import Mu from 'mu';
import sanitizeFilename from 'sanitize-filename';
import * as Config from '../config.js';
import * as Queries from '../queries/index.js';

export async function saveText(filename, extension, mimeType, contentString) {
  let muFileRecord = createRecord(filename, extension, mimeType);
  await Fs.promises.writeFile(muFileRecord.path, contentString, 'utf-8');
  await updateRecordStats(muFileRecord);
  let fileInsertQuery = Queries.Files.create(
    muFileRecord.records.user,
    muFileRecord.records.storage
  );
  await updateSudo(fileInsertQuery);
  return muFileRecord;
}

/** @typedef {ReturnType<typeof createRecord>} MuFileRecord */
export function createRecord(userFilename, extension, mimeType) {
  let saneUserFilename = sanitizeFilename(userFilename);
  let userBasename = saneUserFilename + '.' + extension;
  let userFileUuid = Mu.uuid();
  let userFileUri = Config.buildResourceUri('files', userFileUuid);

  /** @type {Queries.Files.FileRecord} */
  let userFileRecord = {
    uri: userFileUri,
    uuid: userFileUuid,
    name: userBasename,
    extension: extension,
    format: mimeType,
  };

  let storagePathBasename = userFileUuid + '.' + extension;
  let storagePath = Path.join(Config.STORAGE_PATH, storagePathBasename);
  let storageFileUri = `share://` + storagePathBasename;
  let storageFileUuid = Mu.uuid();
  let storageFilename = storageFileUuid + '.' + extension;
  /** @type {Queries.Files.PhysicalFileRecord} */
  let storageFileRecord = {
    uri: storageFileUri,
    uuid: storageFileUuid,
    name: storageFilename,
    extension: extension,
    format: mimeType,
  };

  return {
    path: storagePath,
    records: { user: userFileRecord, storage: storageFileRecord },
  };
}

/** @param {MuFileRecord} muFileRecord */
export async function updateRecordStats(muFileRecord) {
  let fileStats = await Fs.promises.stat(muFileRecord.path);

  let { user: userFileRecord, storage: storageFileRecord } =
    muFileRecord.records;

  userFileRecord.size = storageFileRecord.size = fileStats.size;
  userFileRecord.createdTime =
    userFileRecord.modifiedTime =
    storageFileRecord.createdTime =
    storageFileRecord.modifiedTime =
      fileStats.birthtime;
}
