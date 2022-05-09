const GovernmentDomains = {
  name: 'Beleidsdomeinen',
  subselect() {
    return `
SELECT DISTINCT
  ?publicationFlow
  (GROUP_CONCAT(?policyDomainLabel; SEPARATOR='/') AS ?group)
WHERE {
  ?publicationFlow
    a pub:Publicatieaangelegenheid ;
    dossier:behandelt ?case.
  ?case
    a dossier:Dossier .
  OPTIONAL {
    ?case ext:beleidsgebied ?policyDomain .
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?policyDomain
        a skos:Concept ;
        skos:prefLabel ?policyDomainLabel ;
        skos:inScheme <http://themis.vlaanderen.be/id/concept-schema/f4981a92-8639-4da4-b1e3-0e1371feaa81> . # policy domains
    }
  }
} ORDER BY ?policyDomainLabel
`;
  },
};

const RegulationType = {
  name: 'Type_regelgeving',
  subselect() {
    return `
SELECT DISTINCT
  ?publicationFlow
  (?regulationTypeLabel As ?group)
WHERE {
  ?publicationFlow a pub:Publicatieaangelegenheid ;
    pub:regelgevingType ?regulationType .
  GRAPH <http://mu.semte.ch/graphs/public> {
    ?regulationType a ext:RegelgevingType ;
      skos:prefLabel ?regulationTypeLabel .
  }
}
`;
  },
};

const MandateePersons = {
  name: 'Ministers',
  subselect() {
    return `
SELECT DISTINCT
  ?publicationFlow
  (GROUP_CONCAT(DISTINCT ?familyName, "/") AS ?group)
WHERE {
  ?publicationFlow a pub:Publicatieaangelegenheid ;
    ext:heeftBevoegdeVoorPublicatie ?mandatee .
  GRAPH <http://mu.semte.ch/graphs/public> {
    ?mandatee a mandaat:Mandataris ;
      mandaat:isBestuurlijkeAliasVan ?person .
    ?person a person:Person ;
      foaf:familyName ?familyName .
  }
} ORDER BY ?familyName
`;
  },
};

export function get(groupName) {
  const mapping = {
    'governmentDomains': GovernmentDomains,
    'regulationType': RegulationType,
    'mandateePersons': MandateePersons,
  };
  return mapping[groupName];
}
