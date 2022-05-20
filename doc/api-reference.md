## Reference
### Configuration
The following environment variables can be configured:
* `MU_SPARQL_ENDPOINT` (default: http://database:8890/sparql): SPARQL endpoint of the internal triple store to read and write file and job records.
* `VIRTUOSO_SPARQL_ENDPOINT` (default: http://virtuoso:8890/sparql): SPARQL endpoint of the Virtuoso triple store, in order to download the csv files.

### Job model
The Job Model is defined in: [app-kaleidos /config/resources/job-domain.lisp](https://github.com/kanselarij-vlaanderen/app-kaleidos/blob/development/config/resources/job-domain.lisp)

### Rapport types
The PublicatieRapportTypes Model is defined in: [app-kaleidos /config/resources/job-domain.lisp](https://github.com/kanselarij-vlaanderen/app-kaleidos/blob/development/config/resources/job-domain.lisp)
The PublicatieRapportTypes code list is declared in: [app-kaleidos /config/migrations/20220511133621-add-publication-report-types.ttl](https://github.com/kanselarij-vlaanderen/app-kaleidos/blob/development/config/migrations/20220511133621-add-publication-report-types.ttl)
For more information about the filters an of the PublicatieRapportTypes see: [doc/report-types.md](./doc/report-types.md)

### Job parameters
The parameters are passed as a JSON object. The schema for this object can be found at [parameter-schema.js](../parameter-schema.js).

An example using all filter parameters:
Note it is not expected the service will be called this way. For the combinations of query options in use see [./report-types.md](./report-types.md))
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