/* eslint-disable prettier/prettier */ // keep interpolated SPARQL strings clear
import * as Groups from './groups.js';
import * as Filters from './filters.js';

/** @see {../../doc/types.md} for documentation of query param combinations in use in the frontend */
export function build(params) {
  let group = Groups.get(params.group);

  return `
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
PREFIX eli: <http://data.europa.eu/eli/ontology#>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX fabio: <http://purl.org/spar/fabio/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
PREFIX person: <http://www.w3.org/ns/person#>
PREFIX persoon: <https://data.vlaanderen.be/ns/persoon#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT
  (?group AS ?${group.name})
  (COUNT(DISTINCT ?publicationFlow) AS ?Aantal_publicaties)
  (SUM(?numberOfPages) AS ?Aantal_bladzijden)
  (SUM(?numberOfExtractsFallback) AS ?Aantal_uittreksels)
FROM <http://mu.semte.ch/graphs/organizations/kanselarij>
FROM NAMED <http://mu.semte.ch/graphs/public>
WHERE {
  { ${group.subselect(params)} }

  OPTIONAL { ?publicationFlow fabio:hasPageCount ?numberOfPages . }

  OPTIONAL { ?publicationFlow pub:aantalUittreksels ?numberOfExtracts . }
  BIND (IF(BOUND(?numberOfExtracts), ?numberOfExtracts, 1) AS ?numberOfExtractsFallback)

  ${Filters.publicationDate(params)}
  ${Filters.decisionDate(params)}
  ${Filters.isViaCouncilOfMinisters(params)}
  ${Filters.governmentDomains(params)}
  ${Filters.regulationType(params)}
  ${Filters.mandateePersons(params)}
}
GROUP BY ?group
ORDER BY ?group
`;
}
