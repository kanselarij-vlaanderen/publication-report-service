/* eslint-disable prettier/prettier */
import { sparqlEscapeDate, sparqlEscapeUri } from 'mu';
import { sparqlEscapeDateLocal } from '../utils.js';

export function publicationDate(params) {
    let publicationDateRange = params.filter.publicationDate;
    let hasFilter = publicationDateRange?.some((date) => date);
    if (!hasFilter) {
      return ``;
    }

    let [publicationDateStart, publicationDateEnd] = publicationDateRange.map(
      (date) => (date ? sparqlEscapeDateLocal(date) : undefined)
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
}

export function decisionDate(params) {
    let decisionDateRange = params.filter.decisionDate;
    let hasFilter = decisionDateRange?.some((date) => date);
    if (!hasFilter) {
      return ``;
    }

    let [decisionDateStart, decisionDateEnd] = decisionDateRange.map((date) =>
      date ? sparqlEscapeDateLocal(date) : undefined
    );

    return `
?publicationFlow dct:subject ?decisionActivity .
?decisionActivity dossier:Activiteit.startdatum ?decisionDate .
${decisionDateStart ? `FILTER (?decisionDate >= ${decisionDateStart})` : ``}
${decisionDateEnd ? `FILTER (?decisionDate < ${decisionDateEnd})` : ``}
`;
}

export function isViaCouncilOfMinisters(params) {
    let isViaCouncilOfMinisters = params.filter.isViaCouncilOfMinisters;
    if (isViaCouncilOfMinisters === undefined) {
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
    FILTER (BOUND(?subcase) = ${isViaCouncilOfMinisters ? `TRUE` : `FALSE`})
  }
}
`;
};

export function governmentDomains(params) {
    let governmentDomains = params.filter.governmentDomains;
    if (!governmentDomains) {
      return ``;
    }

    let _governmentDomains = governmentDomains.map((uri) => sparqlEscapeUri(uri));
    return `
{
  SELECT DISTINCT ?publicationFlow WHERE {
    VALUES ?governmentDomain { ${ _governmentDomains.join('\n') } }
    ?publicationFlow dossier:behandelt ?case .
    ?case a dossier:Dossier ;
      ext:beleidsgebied ?governmentDomain .
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?governmentDomain a skos:Concept ;
        skos:inScheme <http://themis.vlaanderen.be/id/concept-schema/f4981a92-8639-4da4-b1e3-0e1371feaa81> .
    }
  }
}
`;
}

export function regulationType(params) {
    let regulationTypes = params.filter.regulationType;
    if (!regulationTypes) {
      return ``;
    }

    let _regulationTypes = regulationTypes.map((uri) => sparqlEscapeUri(uri));
    return `
{
  SELECT DISTINCT ?publicationFlow WHERE {
    VALUES ?regulationType { ${ _regulationTypes.join('\n') } }
    ?publicationFlow pub:regelgevingType ?regulationType .
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?regulationType a ext:RegelgevingType .
    }
  }
}
`;
}

export function mandateePersons(params) {
    let mandateePersons = params.filter.mandateePersons;
    if (!mandateePersons) {
      return ``;
    }

    let _mandateePersons = mandateePersons.map((mandatee) => sparqlEscapeUri(mandatee));
    return `
{
  SELECT DISTINCT ?publicationFlow WHERE {
    VALUES ?person { ${_mandateePersons.join('\n')} }
    ?publicationFlow a pub:Publicatieaangelegenheid ;
      ext:heeftBevoegdeVoorPublicatie ?mandatee .
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?mandatee a mandaat:Mandataris ;
        mandaat:isBestuurlijkeAliasVan ?person .
      ?person a person:Person .
    }
  }
}
`;
};
