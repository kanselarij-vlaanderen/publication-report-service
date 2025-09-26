import { sparqlEscapeUri} from 'mu';
import { GRAPHS, CONCEPT_SCHEME_GOV_DOMAIN } from '../../config.js';

// fragments included in SPARQL query built in index.js
const GovernmentDomains = {
  name: 'Beleidsdomeinen',
  subselect() {
    return `
SELECT
  ?publicationFlow
  (GROUP_CONCAT(?policyDomainLabelFallback; SEPARATOR='/') AS ?group)
WHERE {
  {
    SELECT DISTINCT COALESCE(?policyDomainLabel, "<geen>") AS ?policyDomainLabelFallback ?publicationFlow WHERE {
      GRAPH ${sparqlEscapeUri(GRAPHS.KANSELARIJ)} {
        ?publicationFlow a pub:Publicatieaangelegenheid .
        OPTIONAL {
          ?publicationFlow pub:beleidsveld ?policyDomain .
          GRAPH ${sparqlEscapeUri(GRAPHS.PUBLIC)} {
            ?policyDomain
              a skos:Concept ;
              skos:prefLabel ?policyDomainLabel ;
              skos:inScheme ${sparqlEscapeUri(CONCEPT_SCHEME_GOV_DOMAIN)} . # policy domains
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
  GRAPH ${sparqlEscapeUri(GRAPHS.KANSELARIJ)} {
    ?publicationFlow a pub:Publicatieaangelegenheid .
    OPTIONAL {
      ?publicationFlow pub:regelgevingType ?regulationType .
      GRAPH ${sparqlEscapeUri(GRAPHS.PUBLIC)} {
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
  GRAPH ${sparqlEscapeUri(GRAPHS.KANSELARIJ)} {
    ?publicationFlow a pub:Publicatieaangelegenheid .
    OPTIONAL {
      ?publicationFlow ext:heeftBevoegdeVoorPublicatie ?mandatee .
      GRAPH ${sparqlEscapeUri(GRAPHS.PUBLIC)} {
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
