// fragments included in SPARQL query built in index.js
import { sparqlEscapeUri } from 'mu';
import { sparqlEscapeDateLocal } from '../utils.js';
import { GRAPHS, CONCEPT_SCHEME_GOV_DOMAIN } from '../../config.js';

export function publicationDate(params) {
    const publicationDateRange = params.filter.publicationDate;
    const hasFilter = publicationDateRange?.some((date) => date);
    if (!hasFilter) {
      return ``;
    }

    const [publicationDateStart, publicationDateEnd] = publicationDateRange.map(
      (date) => (date ? sparqlEscapeDateLocal(date) : undefined)
    );
    return `
{
  SELECT
    ?publicationFlow
    (MIN(?publicationDate) AS ?minPublicationDate)
  WHERE {
    GRAPH ${sparqlEscapeUri(GRAPHS.KANSELARIJ)} {
      ?publicationFlow a pub:Publicatieaangelegenheid ;
        pub:doorlooptPublicatie ?publicationSubcase .
      ?publicationActivity pub:publicatieVindtPlaatsTijdens ?publicationSubcase .
      ?publicationActivity a pub:PublicatieActiviteit ;
        prov:generated ?decision .
    }
    VALUES ?g { ${sparqlEscapeUri(GRAPHS.KANSELARIJ)} ${sparqlEscapeUri(GRAPHS.STAATSBLAD)} }
    GRAPH ?g {
      ?decision a eli:LegalResource;
        eli:date_publication ?publicationDate .
    }
  }
}

${publicationDateStart ? `FILTER (?minPublicationDate >= ${publicationDateStart})` : ``}
${publicationDateEnd ? `FILTER (?minPublicationDate < ${publicationDateEnd})` : ``}
`;
}

export function decisionDate(params) {
    const decisionDateRange = params.filter.decisionDate;
    const hasFilter = decisionDateRange?.some((date) => date);
    if (!hasFilter) {
      return ``;
    }

    const [decisionDateStart, decisionDateEnd] = decisionDateRange.map((date) =>
      date ? sparqlEscapeDateLocal(date) : undefined
    );

    return `
GRAPH ${sparqlEscapeUri(GRAPHS.KANSELARIJ)} {
  ?publicationFlow dct:subject ?decisionActivity .
  ?decisionActivity dossier:Activiteit.startdatum ?decisionDate .
  ${decisionDateStart ? `FILTER (?decisionDate >= ${decisionDateStart})` : ``}
  ${decisionDateEnd ? `FILTER (?decisionDate < ${decisionDateEnd})` : ``}
}
`;
}

export function isViaCouncilOfMinisters(params) {
    const isViaCouncilOfMinisters = params.filter.isViaCouncilOfMinisters;
    if (isViaCouncilOfMinisters === undefined) {
      return ``;
    }

    return `
{
  SELECT DISTINCT
   ?publicationFlow
  WHERE {
    GRAPH ${sparqlEscapeUri(GRAPHS.KANSELARIJ)} {
      ?publicationFlow a pub:Publicatieaangelegenheid ;
        dossier:behandelt ?case .
      ?case a dossier:Dossier .
      OPTIONAL {
        ?case dossier:Dossier.isNeerslagVan ?decisionFlow .
        ?decisionFlow dossier:doorloopt ?subcase  .
        ?subcase a dossier:Procedurestap .
      }
      FILTER (BOUND(?subcase) = ${isViaCouncilOfMinisters ? `TRUE` : `FALSE`})
    }
  }
}
`;
};

export function governmentDomains(params) {
    const governmentDomains = params.filter.governmentDomains;
    if (!governmentDomains) {
      return ``;
    }
    const governmentDomainUris = governmentDomains.map((uri) => sparqlEscapeUri(uri));
    return `
{
  SELECT DISTINCT ?publicationFlow WHERE {
    VALUES ?governmentDomain { ${ governmentDomainUris.join('\n') } }
    GRAPH ${sparqlEscapeUri(GRAPHS.KANSELARIJ)} {
      ?publicationFlow pub:beleidsveld ?governmentDomain .
    }
    GRAPH ${sparqlEscapeUri(GRAPHS.PUBLIC)} {
      ?governmentDomain a skos:Concept ;
        skos:inScheme ${sparqlEscapeUri(CONCEPT_SCHEME_GOV_DOMAIN)} .
    }
  }
}
`;
}

export function regulationType(params) {
    const regulationTypes = params.filter.regulationType;
    if (!regulationTypes) {
      return ``;
    }

    const regulationTypesUris = regulationTypes.map((uri) => sparqlEscapeUri(uri));
    return `
{
  SELECT DISTINCT ?publicationFlow WHERE {
    VALUES ?regulationType { ${ regulationTypesUris.join('\n') } }
    GRAPH ${sparqlEscapeUri(GRAPHS.KANSELARIJ)} {
      ?publicationFlow pub:regelgevingType ?regulationType .
    }
    GRAPH ${sparqlEscapeUri(GRAPHS.PUBLIC)} {
      ?regulationType a ext:RegelgevingType .
    }
  }
}
`;
}

export function mandateePersons(params) {
    const mandateePersons = params.filter.mandateePersons;
    if (!mandateePersons) {
      return ``;
    }

    const mandateePersonUris = mandateePersons.map((mandatee) => sparqlEscapeUri(mandatee));
    return `
{
  SELECT DISTINCT ?publicationFlow WHERE {
    VALUES ?person { ${mandateePersonUris.join('\n')} }
    GRAPH ${sparqlEscapeUri(GRAPHS.KANSELARIJ)} {
      ?publicationFlow a pub:Publicatieaangelegenheid ;
      ext:heeftBevoegdeVoorPublicatie ?mandatee .
    }
    GRAPH ${sparqlEscapeUri(GRAPHS.PUBLIC)} {
      ?mandatee a mandaat:Mandataris ;
        mandaat:isBestuurlijkeAliasVan ?person .
      ?person a person:Person .
    }
  }
}
`;
};
