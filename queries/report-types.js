import { query, sparqlEscapeUri} from 'mu';

export async function findReportType(reportTypeUri) {
  const _reportTypeUri =
    reportTypeUri !== undefined ? sparqlEscapeUri(reportTypeUri) : undefined;

  const queryString = `
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
  return await query(queryString);
}
