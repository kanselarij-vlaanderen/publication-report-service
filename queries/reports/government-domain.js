export function build() {
  return `
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX eli: <http://data.europa.eu/eli/ontology#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX fabio: <http://purl.org/spar/fabio/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT (?policyDomainGroupLabel AS ?beleidsdomein) (SUM(?numberOfPages) AS ?aantalBlz) (COUNT(DISTINCT ?publicationFlow) AS ?aantalPublicaties)
WHERE {
    {
        SELECT ?publicationFlow (GROUP_CONCAT(?policyDomainLabel; SEPARATOR='/') AS ?policyDomainGroupLabel) WHERE {
            ?publicationFlow
                a pub:Publicatieaangelegenheid ;
                dossier:behandelt ?case.
            ?case
                a dossier:Dossier .
            OPTIONAL {
                ?case ext:beleidsgebied ?policyDomain .
                ?policyDomain
                    a skos:Concept ;
                    skos:prefLabel ?policyDomainLabel ;
                    skos:inScheme <http://themis.vlaanderen.be/id/concept-schema/f4981a92-8639-4da4-b1e3-0e1371feaa81> . # policy domains
            }
        } GROUP BY ?publicationFlow
    }

    OPTIONAL { ?publicationFlow fabio:hasPageCount ?numberOfPages . }

    # # Filter op publicatiedatum
    # ?publicationFlow pub:doorlooptPublicatie / ^pub:publicatieVindtPlaatsTijdens / prov:generated ?decision .
    # ?decision eli:date_publication ?publicationDate .
    # FILTER(?publicationDate > "2018-01-01"^^xsd:date && ?publicationDate < "2019-01-01"^^xsd:date)

    # # Filter op beslissingsdatum
    # ?publicationFlow dct:subject ?decisionActivity .
    # ?decisionActivity dossier:Activiteit.startdatum ?decisionDate .
    # FILTER(?decisionDate > "2018-01-01"^^xsd:date && ?decisionDate < "2019-01-01"^^xsd:date)
}
GROUP BY ?policyDomainGroupLabel
ORDER BY ?policyDomainGroupLabel
`;
}
