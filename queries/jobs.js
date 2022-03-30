import Mu from 'mu';
import { Status } from '../lib/download-job';

export function buildGet(jobUri) {
  let _jobUri = Mu.sparqlEscapeUri(jobUri);

  return `
  PREFIX cogs: <http://vocab.deri.ie/cogs#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX prov: <http://www.w3.org/ns/prov#>
  PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>

  SELECT *
  WHERE {
    ${_jobUri} a pub:PublicationMetricsExportJob .
    ${_jobUri} dct:created ?createdTime .
    ${_jobUri} pub:exportJobConfig ?config .
    OPTIONAL { ${_jobUri} ext:status ?statusUri . }
    OPTIONAL { ${_jobUri} prov:startedAtTime ?startTime . }
    OPTIONAL { ${_jobUri} prov:startedAtTime ?endTime . }
    ${_jobUri} prov:wasStartedBy ?userUri .
    OPTIONAL { ${_jobUri} prov:generated ?fileUri . }
  }
  `;
}

/** @typedef {ReturnType<parseGet>} Job */
export function parseGet(data) {
  let jobResult = data.results.bindings[0];

  let createdTime = Date.parse(jobResult.createdTime.value);
  let config = JSON.parse(jobResult.config.value);
  let startTime = Date.parse(jobResult.startTime?.value);
  let endTime = Date.parse(jobResult.endTime?.value);

  return {
    createdTime: createdTime,
    config: config,
    statusUri: jobResult.statusUri?.value,
    startTime: startTime,
    endTime: endTime,
    userUri: jobResult.userUri.value,
    fileUri: jobResult.fileUri?.value,
  };
}

export function updateStatusToRunning(jobUri, time) {
  return _updateStatus(jobUri, Status.RUNNING, time);
}

export function updateStatusToSuccess(jobUri, time) {
  return _updateStatus(jobUri, Status.SUCCESS, time);
}

export function updateStatusToFail(jobUri, time) {
  return _updateStatus(jobUri, Status.FAIL, time);
}

export function _updateStatus(jobUri, status, time) {
  let timePred;
  if (
    status === Status.SUCCESS ||
    status === Status.FAIL /* final statusses */
  ) {
    timePred = 'http://www.w3.org/ns/prov#endedAtTime';
  } else {
    timePred = 'http://www.w3.org/ns/prov#startedAtTime';
  }
  let _jobUri = Mu.sparqlEscapeUri(jobUri);

  return `
  PREFIX cogs: <http://vocab.deri.ie/cogs#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX prov: <http://www.w3.org/ns/prov#>
  PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>

  DELETE {
      GRAPH ?g {
        ${_jobUri} ext:status ?status ;
            ${Mu.sparqlEscapeUri(timePred)} ?time .
      }
  }
  INSERT {
      GRAPH ?g {
          ${_jobUri} ext:status ${Mu.sparqlEscapeUri(status)} ;
              ${Mu.sparqlEscapeUri(timePred)} ${Mu.sparqlEscapeDateTime(time)} .
      }
  }
  WHERE {
      GRAPH ?g {
          ${_jobUri} a pub:PublicationMetricsExportJob .
          OPTIONAL { ${_jobUri} ext:status ?status }
          OPTIONAL { ${_jobUri} ${Mu.sparqlEscapeUri(timePred)} ?time }
      }
  }`;
}
