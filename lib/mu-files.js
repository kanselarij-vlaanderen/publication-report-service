import Path from 'path';
import Fs from 'fs';
import sanitizeFilename from 'sanitize-filename';
import * as Config from '../config.js';
import * as Queries from '../queries/index.js';
import { uuid } from 'mu';

export async function saveText(filename, extension, mimeType, contentString) {
  const muFileRecord = createRecord(filename, extension, mimeType);
  await Fs.promises.writeFile(muFileRecord.path, contentString, 'utf-8');
  await updateRecordStats(muFileRecord);
  await Queries.Files.create(
    muFileRecord.records.user,
    muFileRecord.records.storage
  );
  return muFileRecord;
}

/** @typedef {ReturnType<typeof createRecord>} MuFileRecord */
export function createRecord(userFilename, extension, mimeType) {
  const saneUserFilename = sanitizeFilename(userFilename);
  const userBasename = saneUserFilename + '.' + extension;
  const userFileUuid = uuid();
  const userFileUri = Config.buildResourceUri('files', userFileUuid);

  /** @type {Queries.Files.FileRecord} */
  const userFileRecord = {
    uri: userFileUri,
    uuid: userFileUuid,
    name: userBasename,
    extension: extension,
    format: mimeType,
  };

  const storagePathBasename = userFileUuid + '.' + extension;
  const storagePath = Path.join(Config.STORAGE_PATH, storagePathBasename);
  const storageFileUri = `share://` + storagePathBasename;
  const storageFileUuid = uuid();
  const storageFilename = storageFileUuid + '.' + extension;
  /** @type {Queries.Files.PhysicalFileRecord} */
  const storageFileRecord = {
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
  const fileStats = await Fs.promises.stat(muFileRecord.path);

  const { user: userFileRecord, storage: storageFileRecord } =
    muFileRecord.records;

  userFileRecord.size = storageFileRecord.size = fileStats.size;
  userFileRecord.createdTime =
    userFileRecord.modifiedTime =
    storageFileRecord.createdTime =
    storageFileRecord.modifiedTime =
      fileStats.birthtime;
}
