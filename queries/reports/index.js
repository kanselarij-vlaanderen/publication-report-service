export function build(params) {
  let group = groups[params.group];

  /* eslint-disable prettier/prettier */
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

  SELECT (?group AS ?${group.name}) (SUM(?numberOfPages) AS ?Aantal_bladzijden) (COUNT(DISTINCT ?publicationFlow) AS ?Aantal_publicaties)
  WHERE {
      { ${group.subselect(params)} }

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
  GROUP BY ?group
  ORDER BY ?group
  `;
  /* eslint-enable */
}

const groups = {
  'government-domain': {
    name: 'Beleidsdomeinen',
    subselect(params) {
      return `
SELECT DISTINCT ?publicationFlow (GROUP_CONCAT(?policyDomainLabel; SEPARATOR='/') AS ?group) WHERE {
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
}
`;
    },
  },
  mandatee: {
    name: 'Ministers',
    subselect(params) {
      return `
SELECT DISTINCT ?publicationFlow (GROUP_CONCAT(DISTINCT ?familyName, "/") AS ?group)
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
`;
    },
  },
  'regulation-type': {
    name: 'Type_regelgeving',
    subselect(params) {
      return `
SELECT DISTINCT ?publicationFlow (?regulationTypeLabel As ?group) WHERE {
  ?publicationFlow pub:regelgevingType ?regulationType .
  ?regulationType a ext:RegelgevingType ;
  skos:prefLabel ?regulationTypeLabel .
}
`;
    },
  },
};
