import mu from 'mu';

const RUNNING = 'http://vocab.deri.ie/cogs#Running';
const SUCCESS = 'http://vocab.deri.ie/cogs#Success';
const FAIL = 'http://vocab.deri.ie/cogs#Fail';

export function get(jobUri) {
  const _jobUri = mu.sparqlEscapeUri(jobUri);

  return `
  PREFIX cogs: <http://vocab.deri.ie/cogs#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX prov: <http://www.w3.org/ns/prov#>
  PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>

  SELECT *
  WHERE {
    ${_jobUri} a pub:PublicationMetricsExportJob .
    ${_jobUri} dct:created ?created .
    ${_jobUri} pub:exportJobConfig ?config .
    OPTIONAL { ${_jobUri} ext:status ?status . }
    OPTIONAL { ${_jobUri} prov:startedAtTime ?startTime . }
    OPTIONAL { ${_jobUri} prov:startedAtTime ?endTime . }
    ${_jobUri} prov:wasStartedBy ?user .
    OPTIONAL { ${_jobUri} prov:generated ?file . }
  }
  `;
}

export function updateStatusToRunning(jobUri, time) {
  return _updateStatus(jobUri, RUNNING, time);
}

export function updateStatusToSuccess(jobUri, time) {
  return _updateStatus(jobUri, SUCCESS, time);
}

export function updateStatusToFail(jobUri, time) {
  return _updateStatus(jobUri, FAIL, time);
}

export function _updateStatus(jobUri, status, time) {
  let timePred;
  if (status === SUCCESS || status === FAIL /* final statusses */) {
    timePred = 'http://www.w3.org/ns/prov#endedAtTime';
  } else {
    timePred = 'http://www.w3.org/ns/prov#startedAtTime';
  }
  const escapedUri = mu.sparqlEscapeUri(jobUri);

  return `
  PREFIX cogs: <http://vocab.deri.ie/cogs#>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>

  DELETE {
      GRAPH ?g {
        ${escapedUri} ext:status ?status ;
            ${mu.sparqlEscapeUri(timePred)} ?time .
      }
  }
  INSERT {
      GRAPH ?g {
          ${escapedUri} ext:status ${mu.sparqlEscapeUri(status)} ;
              ${mu.sparqlEscapeUri(timePred)} ${mu.sparqlEscapeDateTime(time)} .
      }
  }
  WHERE {
      GRAPH ?g {
          ${escapedUri} a pub:PublicationMetricsExportJob .
          OPTIONAL { ${escapedUri} ext:status ?status }
          OPTIONAL { ${escapedUri} ${mu.sparqlEscapeUri(timePred)} ?time }
      }
  }`;
}
