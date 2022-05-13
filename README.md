<div style="text-align: center; font-size: 20px; background-color: #ffeeaa;">
🚧 Under development 🚧
</div>

# Publication Report Service
Microservice that exports reports about the number of processed publication-flows as CSV files.
The service is triggered by the notification of the creation of a `pub:PublicationMetricsExportJob` by the deltanotifier service. The file is downloaded to the server.
The frontend does not access this service directly: both the request by the user and the download to the users computer are handled outside of this service.

## Getting started
### Add the export service to your stack
#### For development
Add the following snippet to `docker-compose.yml`:
```yml
  publication-report:
    build: $PUBLCIATION_REPORTS_DIRECTORY
    volumes:
      - $PUBLCIATION_REPORTS_DIRECTORY:/app
      - ./data/files:/share
    environment:
      - NODE_ENV=development
      - MU_SPARQL_ENDPOINT=http://database:8890/sparql
      - VIRTUOSO_SPARQL_ENDPOINT=http://triplestore:8890/sparql
```
### Deltanotifier
Add the following snippet to `config/delta/rules.js`
```javascript
  {
    match: {
      predicate: {
        type: 'uri',
        value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
      },
      object: {
        type: 'uri',
        value: 'http://mu.semte.ch/vocabularies/ext/publicatie/PublicationMetricsExportJob'
      }
    },
    callback: {
      url: 'http://publication-report/delta',
      method: 'POST'
    },
    options: {
      resourceFormat: 'v0.0.1',
      gracePeriod: 250,
      ignoreFromSelf: false
    }
  },
```
## How-to guides
### How to trigger the export of a report
The service is triggered by the notification of the creation of a `pub:PublicationMetricsExportJob` record by the deltanotifier service. The file is downloaded to the server.

Example of the creation of a `pub:PublicationMetricsExportJob` in [frontend-kaleidos]
(https://github.com/kanselarij-vlaanderen/frontend-kaleidos).
```javascript
    let user = await this.currentSession.user;
    let now = new Date();
    let job = this.store.createRecord('publication-metrics-export-job', {
      created: now,
      generatedBy: user,
      config: {
        name: yourReportName,
        query: {
          group: yourReportGroup,
          filter: {
            ...yourReportFilters,
          },
        },
      },
    });
    await job.save();
```

## Reference
### Configuration
The following environment variables can be configured:
* `MU_SPARQL_ENDPOINT` (default: http://database:8890/sparql): SPARQL endpoint of the internal triple store to read and write file and job records.
* `VIRTUOSO_SPARQL_ENDPOINT` (default: http://virtuoso:8890/sparql): SPARQL endpoint of the Virtuoso triple store, in order to download the csv files.

### Job parameters
The parameters are passed as a JSON object. The schema for this object can be found at [parameter-schema.js](./parameter-schema.js).

An example using all filter parameters:
```javascript
  let jobParams = {
    name: 'Publicatierapport',
    query: {
      group: 'mandateePersons',
      filter: {
        decisionDate: [new Date('2022-01-01T00:00:00.000Z'), new Date('2023-01-01T00:00:00.000Z')],
        publicationDate: [new Date('2022-01-01T00:00:00.000Z'), new Date('2023-01-01T00:00:00.000Z')],
        isViaCouncilOfMinisters: true,
        regulationType: ['http://themis.vlaanderen.be/id/concept/regelgeving-type/bf6101a9-d06b-44d4-b629-13965654c8c2','http://themis.vlaanderen.be/id/concept/regelgeving-type/ea7f5f79-f81c-459b-a0f7-d8e90e2d9b88'],
        governmentDomains: ['http://kanselarij.vo.data.gift/id/beleidsdomein/22a39165-e17c-4a52-963a-9fa3d097907c', 'http://kanselarij.vo.data.gift/id/beleidsdomein/82535aaf-39ec-4b31-a181-f44241a65c93'],
        mandateePersons: ['http://themis.vlaanderen.be/id/persoon/5fed907ee6670526694a071a','http://themis.vlaanderen.be/id/persoon/5fed907de6670526694a061b']
      },
    },
  };
```

#### Filter options
- `decisionDate`:
  - **possible values**: an array containing the from and to date of the date range; Both can be set to `null` for an open ended range. In order not to filter: don't specify or set to `null`.
- `publicationDate`:
  - **filter on**: first publication date
  - **possible values**: an array containing the from and to date of the date range; Both can be set to `null` for an open ended range. In order not to filter: don't specify or set to `null`.
- `isViaCouncilOfMinisters`: `true`/`false`; in order not to filter: don't specify or set to `null`.
- `regulationType`:
  - **possible values**: an array of URI's
- `mandateePersons`:
  - **filter on**: a `Person` belonging to a `Mandatee`. The data model specifies a `Person` can "have" multiple `Mandatees`, meaning can have been a mandatee for multiple times/mandates. We combine multiple `Mandatees` belonging to the same `Person` into one entry.
  - **possible values**: an array of URI's
- `governmentDomains`:
  - **possible values**: an array of URI's
#### Group options
- `regulationType`
- `mandateePersons`:
  - **group by**: distinct set of `Persons` attached via `Mandatees` to the `PublicationFlow`
- `governmentDomains`
  - **group by**: distinct set of `GovernmentDomains` attached to `PublicationFlow`