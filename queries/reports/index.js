/* eslint-disable prettier/prettier */ // keep interpolated SPARQL strings clear
import { sparqlEscapeDate, sparqlEscapeUri } from 'mu';

export function build(params) {
  let group = Groups[params.group];

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
  (SUM(?numberOfPages) AS ?Aantal_bladzijden)
  (COUNT(DISTINCT ?publicationFlow) AS ?Aantal_publicaties)
WHERE {
  { ${group.subselect(params)} }

  OPTIONAL { ?publicationFlow fabio:hasPageCount ?numberOfPages . }

  ${Filters.publicationDate(params)}
  ${Filters.decisionDate(params)}
  ${Filters.isViaCouncilOfMinisters(params)}
  ${Filters.governmentDomain(params)}
}
GROUP BY ?group
ORDER BY ?group
  `;
}

const Groups = {
  'government-domain': {
    name: 'Beleidsdomeinen',
    subselect(params) {
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
SELECT DISTINCT
  ?publicationFlow
  (GROUP_CONCAT(DISTINCT ?familyName, "/") AS ?group)
WHERE {
  ?publicationFlow a pub:Publicatieaangelegenheid ;
    ext:heeftBevoegdeVoorPublicatie ?mandatee .
  ?mandatee a mandaat:Mandataris ;
    mandaat:isBestuurlijkeAliasVan ?person .
  ?person a person:Person ;
    foaf:familyName ?familyName .
}
`;
    },
  },
  'regulation-type': {
    name: 'Type_regelgeving',
    subselect(params) {
      return `
SELECT DISTINCT
  ?publicationFlow
  (?regulationTypeLabel As ?group)
WHERE {
  ?publicationFlow a pub:Publicatieaangelegenheid ;
    pub:regelgevingType ?regulationType .
  ?regulationType a ext:RegelgevingType ;
    skos:prefLabel ?regulationTypeLabel .
}
`;
    },
  },
};

const Filters = {
  publicationDate(params) {
    let publicationDateRange = params.filter.publicationDate ?? [null, null];
    let hasFilter = publicationDateRange.some((date) => date);
    if (!hasFilter) {
      return ``;
    }

    let [publicationDateStart, publicationDateEnd] = publicationDateRange.map(
      (date) => (date ? sparqlEscapeDate(date) : null)
    );
    return `
{
  SELECT
    ?publicationFlow
    (MIN(?publicationDate) AS ?minPublicationDate)
  WHERE {
    ?publicationFlow a pub:Publicatieaangelegenheid ;
      pub:doorlooptPublicatie ?publicationSubcase .
    ?publicationActivity pub:publicatieVindtPlaatsTijdens ?publicationSubcase .
    ?publicationActivity a pub:PublicatieActiviteit ;
      prov:generated ?decision .
    ?decision a eli:LegalResource;
      eli:date_publication ?publicationDate .
  }
}

${publicationDateStart ? `FILTER (?minPublicationDate >= ${publicationDateStart})` : ``}
${publicationDateEnd ? `FILTER (?minPublicationDate < ${publicationDateEnd})` : ``}
`;
  },
  decisionDate(params) {
    let decisionDateRange = params.filter.decisionDate ?? [null, null];
    let hasFilter = decisionDateRange.some((date) => date);
    if (!hasFilter) {
      return ``;
    }

    let [decisionDateStart, decisionDateEnd] = decisionDateRange.map((date) =>
      date ? sparqlEscapeDate(date) : null
    );

    return `
?publicationFlow dct:subject ?decisionActivity .
?decisionActivity dossier:Activiteit.startdatum ?decisionDate .
${decisionDateStart ? `FILTER (?decisionDate > ${decisionDateStart})` : ``}
${decisionDateEnd ? `FILTER (?decisionDate < ${decisionDateEnd})` : ``}
`;
  },
  isViaCouncilOfMinisters(params) {
    let isViaCouncilOfMinisters = params.filter.isViaCouncilOfMinisters;
    if (isViaCouncilOfMinisters === null) {
      return ``;
    }

    return `
{
  SELECT DISTINCT
   ?publicationFlow
  WHERE {
    ?publicationFlow a pub:Publicatieaangelegenheid ;
      dossier:behandelt ?case .
    ?case a dossier:Dossier .
    OPTIONAL {
      ?case dossier:doorloopt ?subcase .
      ?subcase a dossier:Procedurestap .
    }
    FILTER (BOUND(?subcase) = ${isViaCouncilOfMinisters ? `TRUE` : `FALSE` })
  }
}
`;
  },
  governmentDomain(params) {
    let governmentDomain = params.filter.governmentDomain;
    if (!governmentDomain) {
      return ``;
    }

    let _governmentDomain = governmentDomain.map((uri) => sparqlEscapeUri(uri));
    return `
VALUES ?governmentDomain { ${ _governmentDomain.join('\n') } }
?case ext:beleidsgebied ?governmentDomain .
?governmentDomain a skos:Concept ;
  skos:inScheme <http://themis.vlaanderen.be/id/concept-schema/f4981a92-8639-4da4-b1e3-0e1371feaa81> .
`;
  }
};
