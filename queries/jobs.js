/* eslint-disable prettier/prettier */
import { sparqlEscapeUri, sparqlEscapeDateTime } from 'mu';

/**
 *
 * @param {string?} jobUri if not provided: return all jobs
 * @returns
 */
export function buildGet(jobUri) {
  let _jobUri = jobUri !== undefined ? sparqlEscapeUri(jobUri) : undefined;

  return `
PREFIX cogs: <http://vocab.deri.ie/cogs#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>

SELECT *
WHERE {
  ${_jobUri ? `VALUES ?jobUri { ${_jobUri} }`: ''}

  ?jobUri a pub:PublicationMetricsExportJob .
  ?jobUri dct:created ?createdTime .
  ?jobUri pub:exportJobConfig ?config .
  ${/* Required relationship, but relations are added by mu-cl-resources in a different INSERT command. */ ''}
  OPTIONAL { ?jobUri dct:type ?reportTypeUri . }
  OPTIONAL { ?jobUri ext:status ?statusUri . }
  OPTIONAL { ?jobUri prov:startedAtTime ?startTime . }
  OPTIONAL { ?jobUri prov:endedAtTime ?endTime . }
  ${/* Required relationship, but relations are added by mu-cl-resources in a different INSERT command. */ ''}
  OPTIONAL { ?jobUri prov:wasStartedBy ?userUri . }
  OPTIONAL { ?jobUri prov:generated ?fileUri . }
}
`;
}

/** @typedef {ReturnType<parseGet>} Job */
export function parseGet(data) {
  let jobRecords = data.results.bindings.map((jobResult) => {
    let createdTime = new Date(jobResult.createdTime.value);
    let config = jobResult.config.value;
    let startTime = jobResult.startTime
      ? new Date(jobResult.startTime.value)
      : undefined;
    let endTime = jobResult.endTime
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

export function updateStatusToRunning(jobUri, time) {
  let _jobUri = sparqlEscapeUri(jobUri);

  return `
  PREFIX cogs: <http://vocab.deri.ie/cogs#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX prov: <http://www.w3.org/ns/prov#>
  PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>

  INSERT {
    GRAPH ?g {
      ${_jobUri} ext:status cogs:Running .
      ${_jobUri} prov:startedAtTime ${sparqlEscapeDateTime(time)} .
    }
  }
  WHERE {
    GRAPH ?g {
      ${_jobUri} a pub:PublicationMetricsExportJob .
    }
  }
`;
}

export function updateStatusToSuccess(jobUri, time, jobResultUri) {
  let _jobUri = sparqlEscapeUri(jobUri);

  return `
PREFIX cogs: <http://vocab.deri.ie/cogs#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>

DELETE {
  GRAPH ?g {
    ${_jobUri} ext:status cogs:Running .
  }
}
INSERT {
  GRAPH ?g {
    ${_jobUri} ext:status cogs:Success .
    ${_jobUri} prov:endedAtTime ${sparqlEscapeDateTime(time)} .
    ${_jobUri} prov:generated ${sparqlEscapeUri(jobResultUri)} .
  }
}
WHERE {
  GRAPH ?g {
    ${_jobUri} a pub:PublicationMetricsExportJob .
  }
}
`;
}

export function updateStatusToError(jobUri, time) {
  let _jobUri = sparqlEscapeUri(jobUri);

  return `
PREFIX cogs: <http://vocab.deri.ie/cogs#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>

DELETE {
  GRAPH ?g {
    ${_jobUri} ext:status ?status .
    ${_jobUri} prov:endedAtTime ?time .
  }
}
INSERT {
  GRAPH ?g {
    ${_jobUri} ext:status cogs:Fail .
    ${_jobUri} prov:endedAtTime ${sparqlEscapeDateTime(time)} .
  }
}
WHERE {
  GRAPH ?g {
    ${_jobUri} a pub:PublicationMetricsExportJob .
    OPTIONAL { ${_jobUri} ext:status ?status . }
    OPTIONAL { ${_jobUri} prov:endedAtTime ?time . }
  }
}
`;
}
