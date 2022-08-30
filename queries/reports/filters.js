/* eslint-disable prettier/prettier */
// fragments included in SPARQL query built in index.js
import { sparqlEscapeDate, sparqlEscapeUri } from 'mu'; // eslint-disable-line
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
    GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
      ?publicationFlow a pub:Publicatieaangelegenheid ;
        pub:doorlooptPublicatie ?publicationSubcase .
      ?publicationActivity pub:publicatieVindtPlaatsTijdens ?publicationSubcase .
      ?publicationActivity a pub:PublicatieActiviteit ;
        prov:generated ?decision .
    }
    VALUES ?g { <http://mu.semte.ch/graphs/organizations/kanselarij> <http://mu.semte.ch/graphs/staatsblad> }
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
    let decisionDateRange = params.filter.decisionDate;
    let hasFilter = decisionDateRange?.some((date) => date);
    if (!hasFilter) {
      return ``;
    }

    let [decisionDateStart, decisionDateEnd] = decisionDateRange.map((date) =>
      date ? sparqlEscapeDateLocal(date) : undefined
    );

    return `
GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
  ?publicationFlow dct:subject ?decisionActivity .
  ?decisionActivity dossier:Activiteit.startdatum ?decisionDate .
  ${decisionDateStart ? `FILTER (?decisionDate >= ${decisionDateStart})` : ``}
  ${decisionDateEnd ? `FILTER (?decisionDate < ${decisionDateEnd})` : ``}
}
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
    GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
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
}
`;
};

export function governmentDomains(params) {
    let governmentDomains = params.filter.governmentDomains;
    if (!governmentDomains) {
      return ``;
    }
    // This is a temporary hack for reports with an end date before 2022-03-02, which is the first date of a publication with a normalized policy domain
    // this fix should be removed after the poicy domains have been normalized
    let publicationDateRange = params.filter.publicationDate;
    if (publicationDateRange) {
      const [publicationDateStart, publicationDateEnd] = publicationDateRange;
      if (publicationDateEnd && publicationDateEnd < new Date('2022-03-02')) {
        return ``;
      }
    }

    let _governmentDomains = governmentDomains.map((uri) => sparqlEscapeUri(uri));
    return `
{
  SELECT DISTINCT ?publicationFlow WHERE {
    VALUES ?governmentDomain { ${ _governmentDomains.join('\n') } }
    GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
      ?publicationFlow dossier:behandelt ?case .
      ?case a dossier:Dossier ;
        besluitvorming:beleidsveld ?governmentDomain .
    }
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
    GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
      ?publicationFlow pub:regelgevingType ?regulationType .
    }
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
    GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
      ?publicationFlow a pub:Publicatieaangelegenheid ;
      ext:heeftBevoegdeVoorPublicatie ?mandatee .
    }
    GRAPH <http://mu.semte.ch/graphs/public> {
      ?mandatee a mandaat:Mandataris ;
        mandaat:isBestuurlijkeAliasVan ?person .
      ?person a person:Person .
    }
  }
}
`;
};
