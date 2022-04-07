import * as Config from '../config.js';
import {
  sparqlEscapeUri,
  sparqlEscapeString,
  sparqlEscapeInt,
  sparqlEscapeDateTime,
} from 'mu';

/**
 * @typedef {{
 *  uri: string,
 *  uuid: string,
 *  name: string,
 *  extension: string,
 *  format: string,
 *  size: number,
 *  createdTime: Date,
 *  modifiedTime: Date,
 * }} FileRecord
 */

/**
 * @param {FileRecord} userFileRecord
 * @param {FileRecord} storageFileRecord
 */
export function create(userFileRecord, storageFileRecord) {
  return `
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
PREFIX dbpedia: <http://dbpedia.org/ontology/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>

INSERT DATA {
  GRAPH ${sparqlEscapeUri(Config.GRAPH)} {
    ${sparqlEscapeUri(userFileRecord.uri)} a nfo:FileDataObject ;
        nfo:fileName ${sparqlEscapeString(userFileRecord.name)} ;
        mu:uuid ${sparqlEscapeString(userFileRecord.uuid)} ;
        dct:format ${sparqlEscapeString(userFileRecord.format)} ;
        nfo:fileSize ${sparqlEscapeInt(userFileRecord.size)} ;
        dbpedia:fileExtension ${sparqlEscapeString(userFileRecord.extension)} ;
        dct:created ${sparqlEscapeDateTime(userFileRecord.createdTime)} ;
        dct:modified ${sparqlEscapeDateTime(userFileRecord.createdTime)} .
    ${sparqlEscapeUri(storageFileRecord.uri)} a nfo:FileDataObject ;
        nie:dataSource ${sparqlEscapeUri(userFileRecord.uri)} ;
        nfo:fileName ${sparqlEscapeString(storageFileRecord.name)} ;
        mu:uuid ${sparqlEscapeString(storageFileRecord.uuid)} ;
        dct:format ${sparqlEscapeString(storageFileRecord.format)} ;
        nfo:fileSize ${sparqlEscapeInt(storageFileRecord.size)} ;
        dbpedia:fileExtension ${sparqlEscapeString(
          storageFileRecord.extension
        )} ;
        dct:created ${sparqlEscapeDateTime(storageFileRecord.createdTime)} ;
        dct:modified ${sparqlEscapeDateTime(storageFileRecord.createdTime)} .
    }
  }
`;
}
