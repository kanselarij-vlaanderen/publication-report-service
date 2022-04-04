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
 * }} FileRecord
 *
 * @typedef {{
 *  uri: string,
 *  uuid: string,
 *  name: string,
 * }} PhysicalFileRecord
 */

/**
 * @param {FileRecord} fileRecord
 * @param {PhysicalFileRecord} physicalFileRecord
 */
export function create(fileRecord, physicalFileRecord) {
  return `
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
  PREFIX dbpedia: <http://dbpedia.org/ontology/>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>

  INSERT DATA {
      GRAPH ${sparqlEscapeUri(Config.GRAPH)} {
          ${sparqlEscapeUri(fileRecord.uri)} a nfo:FileDataObject ;
                nfo:fileName ${sparqlEscapeString(fileRecord.name)} ;
                mu:uuid ${sparqlEscapeString(fileRecord.uuid)} ;
                dct:format ${sparqlEscapeString(fileRecord.format)} ;
                nfo:fileSize ${sparqlEscapeInt(fileRecord.size)} ;
                dbpedia:fileExtension ${sparqlEscapeString(
                  fileRecord.extension
                )} ;
                dct:created ${sparqlEscapeDateTime(fileRecord.createdTime)} ;
                dct:modified ${sparqlEscapeDateTime(fileRecord.createdTime)} .
          ${sparqlEscapeUri(physicalFileRecord.uri)} a nfo:FileDataObject ;
                nie:dataSource ${sparqlEscapeUri(fileRecord.uri)} ;
                nfo:fileName ${sparqlEscapeString(physicalFileRecord.name)} ;
                mu:uuid ${sparqlEscapeString(physicalFileRecord.uuid)} ;
                dct:format ${sparqlEscapeString(fileRecord.format)} ;
                nfo:fileSize ${sparqlEscapeInt(fileRecord.size)} ;
                dbpedia:fileExtension ${sparqlEscapeString(
                  fileRecord.extension
                )} ;
                dct:created ${sparqlEscapeDateTime(fileRecord.createdTime)} ;
                dct:modified ${sparqlEscapeDateTime(fileRecord.createdTime)} .
      }
  }`;
}
