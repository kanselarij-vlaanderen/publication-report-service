import * as Mu from 'mu';

export function buildGet(reportTypeUri) {
  let _reportTypeUri =
    reportTypeUri !== undefined ? Mu.sparqlEscapeUri(reportTypeUri) : undefined;

  return `
PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

SELECT *
WHERE {
  ${_reportTypeUri ? `VALUES ?uri { ${_reportTypeUri} }` : ''}

  ?uri a pub:Publicatierapporttype .
  ?uri mu:uuid ?uuid .
  ?uri skos:prefLabel ?label .
}
`;
}
