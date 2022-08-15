// fragments included in SPARQL query built in index.js
const GovernmentDomains = {
  name: 'Beleidsdomeinen',
  subselect() {
    return `
SELECT
  ?publicationFlow
  (GROUP_CONCAT(COALESCE(?policyDomainLabelFallback, "<geen>"); SEPARATOR='/') AS ?group)
WHERE {
  {
    SELECT DISTINCT COALESCE(?policyDomainLabel, "<geen>") AS ?policyDomainLabelFallback ?publicationFlow WHERE {
      GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
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
      }
    }
  }
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
  COALESCE(?regulationTypeLabel, "<geen>") as ?group
WHERE {
  GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
    ?publicationFlow a pub:Publicatieaangelegenheid .
    OPTIONAL {
      ?publicationFlow pub:regelgevingType ?regulationType .
      GRAPH <http://mu.semte.ch/graphs/public> {
        ?regulationType a ext:RegelgevingType ;
          skos:prefLabel ?regulationTypeLabel .
      }
    }
  }
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
  (GROUP_CONCAT(DISTINCT COALESCE(?familyName, "<geen>") as ?familyNameFallback, '/' ) AS ?group) # DISTINCT some mandatees and some persons have multiple entries
WHERE {
  GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
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
  }
}
GROUP BY ?publicationFlow
ORDER BY ?group
`;
  },
};

export function get(groupName) {
  const MAPPING = {
    governmentDomains: GovernmentDomains,
    regulationType: RegulationType,
    mandateePersons: MandateePersons,
  };
  return MAPPING[groupName];
}
