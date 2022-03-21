export async function query() {
  return `
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX eli: <http://data.europa.eu/eli/ontology#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX pub: <http://mu.semte.ch/vocabularies/ext/publicatie/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX fabio: <http://purl.org/spar/fabio/#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX dct: <http://purl.org/dc/terms/>

SELECT
    (?regulationTypeLabel AS ?Type_regelgeving)
    (SUM(?numberOfPages) AS ?Aantal_blz)
    (COUNT(DISTINCT ?publicationFlow) AS ?Aantal_publicaties)
WHERE {
    ?publicationFlow a pub:Publicatieaangelegenheid .
    ?publicationFlow dossier:behandelt ?case.
    ?case a dossier:Dossier .

    OPTIONAL { ?publicationFlow fabio:hasPageCount ?numberOfPages . }

    OPTIONAL {
        ?publicationFlow pub:regelgevingType ?regulationType .
        ?regulationType a ext:RegelgevingType ;
        skos:prefLabel ?regulationTypeLabel .
    }
}
GROUP BY ?regulationTypeLabel
`;
}
