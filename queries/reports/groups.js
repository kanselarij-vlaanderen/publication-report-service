const GovernmentDomains = {
  name: 'Beleidsdomeinen',
  subselect() {
    return `
SELECT DISTINCT
  ?publicationFlow
  (GROUP_CONCAT(?policyDomainLabelFallback; SEPARATOR='/') AS ?group)
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
  BIND (IF (BOUND(?policyDomainLabel), ?policyDomainLabel, "<geen>") AS ?policyDomainLabelFallback)
}
GROUP BY ?publicationFlow
ORDER BY ?group
`;
  },
};

const RegulationType = {
  name: 'Type_regelgeving',
  subselect() {
    return `
SELECT
  ?publicationFlow
  (?regulationTypeLabelFallback As ?group)
WHERE {
  ?publicationFlow a pub:Publicatieaangelegenheid .
  OPTIONAL {
    ?publicationFlow pub:regelgevingType ?regulationType .
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?regulationType a ext:RegelgevingType ;
        skos:prefLabel ?regulationTypeLabel .
    }
  }
  BIND (IF (BOUND(?regulationTypeLabel), ?regulationTypeLabel, '<geen>') AS ?regulationTypeLabelFallback)
}
ORDER BY ?group
`;
  },
};

const MandateePersons = {
  name: 'Ministers',
  subselect() {
    return `
SELECT
  ?publicationFlow
  (GROUP_CONCAT(?familyNameFallback, '/') AS ?group)
WHERE {
  ?publicationFlow a pub:Publicatieaangelegenheid .
  OPTIONAL {
    ?publicationFlow ext:heeftBevoegdeVoorPublicatie ?mandatee .
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?mandatee a mandaat:Mandataris ;
        mandaat:isBestuurlijkeAliasVan ?person .
      ?person a person:Person ;
        foaf:familyName ?familyName .
    }
  }
  BIND (IF (BOUND(?familyName), ?familyName, '<geen>') AS ?familyNameFallback)
}
GROUP BY ?publicationFlow
ORDER BY ?group
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
