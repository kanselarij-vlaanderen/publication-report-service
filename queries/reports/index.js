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
PREFIX adms: <http://www.w3.org/ns/adms#>

SELECT
  (?group AS ?${group.name})
  (COUNT(DISTINCT ?publicationFlow) AS ?Aantal_publicaties)
  (SUM(COALESCE(?numberOfPages, 0)) AS ?Aantal_bladzijden)
  (SUM(COALESCE(?numberOfExtracts, 1)) AS ?Aantal_uittreksels)
WHERE {
  { ${group.subselect(params)} }

  GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
    OPTIONAL { ?publicationFlow fabio:hasPageCount ?numberOfPages . }

    OPTIONAL { ?publicationFlow pub:aantalUittreksels ?numberOfExtracts . }

    ?publicationFlow adms:status <http://themis.vlaanderen.be/id/concept/publicatie-status/2f8dc814-bd91-4bcf-a823-baf1cdc42475> . # Gepubliceerd
  }

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
