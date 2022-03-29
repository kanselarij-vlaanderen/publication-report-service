export function build() {
  return `
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX eli: <http://data.europa.eu/eli/ontology#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
PREFIX persoon: <https://data.vlaanderen.be/ns/persoon#>
PREFIX person: <http://www.w3.org/ns/person#>
PREFIX fabio: <http://purl.org/spar/fabio/#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
PREFIX dct: <http://purl.org/dc/terms/>

SELECT ?bevoegdeMinisters (SUM(?numberOfPages) AS ?aantalBlz) (COUNT(DISTINCT ?publicationFlow) AS ?aantalPublicaties)
WHERE {
    {
        SELECT DISTINCT ?publicationFlow (GROUP_CONCAT(DISTINCT ?familyName, "/") AS ?bevoegdeMinisters)
        WHERE {
            ?mandatee
                a mandaat:Mandataris ;
                mandaat:isBestuurlijkeAliasVan ?person .
            ?person
                a person:Person ;
                foaf:familyName ?familyName .
            ?publicationFlow
                a pub:Publicatieaangelegenheid ;
                ext:heeftBevoegdeVoorPublicatie ?mandatee .
        }
    }
    OPTIONAL { ?publicationFlow fabio:hasPageCount ?numberOfPages . }

    # Filter op publicatiedatum
    # ?publicationFlow pub:doorlooptPublicatie / ^pub:publicatieVindtPlaatsTijdens / prov:generated ?decision .
    # ?decision eli:date_publication ?publicationDate .
    # FILTER(?publicationDate > "2020-01-01"^^xsd:date && ?publicationDate < "2021-01-01"^^xsd:date)

    # Filter op beslissingsdatum
    # ?publicationFlow dct:subject ?decisionActivity .
    # ?decisionActivity dossier:Activiteit.startdatum ?decisionDate .
    # FILTER(?decisionDate > "2020-01-01"^^xsd:date && ?decisionDate < "2021-01-01"^^xsd:date)

    # Filter op type regelgeving
    #?publicationFlow pub:regelgevingType <http://themis.vlaanderen.be/id/concept/regelgeving-type/ea7f5f79-f81c-459b-a0f7-d8e90e2d9b88> . # BVR

}
GROUP BY ?bevoegdeMinisters
ORDER BY ASC(?bevoegdeMinisters)
`;
}
