import Path from 'path';
import Fs from 'fs';
import Mu from 'mu';
import sanitizeFilename from 'sanitize-filename';

import * as Config from '../config.js';

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

  userFileRecord.size = fileStats.size;
  let createdTime = fileStats.birthtime;
  userFileRecord.createdTime = createdTime;
  storageFileRecord.createdTime = createdTime;
}
