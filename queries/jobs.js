import { sparqlEscapeUri, sparqlEscapeDateTime, sparqlEscapeString, query, update } from 'mu';
import { JOB } from '../config';

/**
 *
 * @param {string?} jobUri if not provided: return all jobs
 * @returns
 */
export function findJob(jobUri) {
  const _jobUri = jobUri !== undefined ? sparqlEscapeUri(jobUri) : undefined;
  const queryString = `
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>
PREFIX adms: <http://www.w3.org/ns/adms#>

SELECT *
WHERE {
  ${_jobUri ? `VALUES ?jobUri { ${_jobUri} }`: ''}

  ?jobUri a ${sparqlEscapeUri(JOB.RDF_TYPE)} .
  ?jobUri dct:created ?createdTime .
  ?jobUri pub:exportJobConfig ?config .
  ${/* Required relationship, but relations are added by mu-cl-resources in a different INSERT command. */ ''}
  OPTIONAL { ?jobUri dct:type ?reportTypeUri . }
  OPTIONAL { ?jobUri adms:status ?statusUri . }
  OPTIONAL { ?jobUri prov:startedAtTime ?startTime . }
  OPTIONAL { ?jobUri prov:endedAtTime ?endTime . }
  ${/* Required relationship, but relations are added by mu-cl-resources in a different INSERT command. */ ''}
  OPTIONAL { ?jobUri prov:wasStartedBy ?userUri . }
  OPTIONAL { ?jobUri prov:generated ?fileUri . }
}
`;

return query(queryString);
}

/** @typedef {ReturnType<parseGet>} Job */
export function parseGet(data) {
  const jobRecords = data.results.bindings.map((jobResult) => {
    const createdTime = new Date(jobResult.createdTime.value);
    const config = jobResult.config.value;
    const startTime = jobResult.startTime
      ? new Date(jobResult.startTime.value)
      : undefined;
    const endTime = jobResult.endTime
      ? new Date(jobResult.endTime.value)
      : undefined;

    return {
      createdTime: createdTime,
      reportTypeUri: jobResult.reportTypeUri?.value,
      config: config,
      statusUri: jobResult.statusUri?.value,
      startTime: startTime,
      endTime: endTime,
      userUri: jobResult.userUri?.value,
      fileUri: jobResult.fileUri?.value,
    };
  });
  return jobRecords;
}

export async function attachResultToJob(job, result) {
  const queryString = `
  PREFIX prov: <http://www.w3.org/ns/prov#>

  INSERT {
      ${sparqlEscapeUri(job)} prov:generated ${sparqlEscapeUri(result)} .
  }
  WHERE {
      ${sparqlEscapeUri(job)} a ${sparqlEscapeUri(JOB.RDF_TYPE)} .
  }`;
  await update(queryString);
  return job;
}

export async function updateJobStatus(uri, status, errorMessage) {
  const time = new Date();
  let timePred;
  if (status === JOB.STATUSES.SUCCESS || status === JOB.STATUSES.FAILED) { // final statusses
    timePred = 'http://www.w3.org/ns/prov#endedAtTime';
  } else {
    timePred = 'http://www.w3.org/ns/prov#startedAtTime';
  }
  const escapedUri = sparqlEscapeUri(uri);
  const queryString = `
  PREFIX adms: <http://www.w3.org/ns/adms#>
  PREFIX schema: <http://schema.org/>

  DELETE {
      ${escapedUri} adms:status ?status ;
          ${sparqlEscapeUri(timePred)} ?time .
  }
  INSERT {
      ${escapedUri} adms:status ${sparqlEscapeUri(status)} ;
          ${
            errorMessage
              ? `schema:error ${sparqlEscapeString(errorMessage)} ;`
              : ''
          }
          ${sparqlEscapeUri(timePred)} ${sparqlEscapeDateTime(time)} .
  }
  WHERE {
      ${escapedUri} a ${sparqlEscapeUri(JOB.RDF_TYPE)} .
      OPTIONAL { ${escapedUri} adms:status ?status }
      OPTIONAL { ${escapedUri} ${sparqlEscapeUri(timePred)} ?time }
  }`;
  await update(queryString);
}
