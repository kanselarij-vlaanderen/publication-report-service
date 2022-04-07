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
Add the following snippet to your `docker-compose.yml`:
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

## How-to guides
### How to trigger the export of a report
The service is triggered by the notification of the creation of a `pub:PublicationMetricsExportJob` record by the deltanotifier service. The file is downloaded to the server.

Example of the creation of a `pub:PublicationMetricsExportJob` in [frontend-kaleidos]
(https://github.com/kanselarij-vlaanderen/frontend-kaleidos).
```
    let user = await this.currentSession.user;
    let now = new Date();
    let job = this.store.createRecord('publication-metrics-export-job', {
      created: now,
      generatedBy: user,
      config: JSON.stringify({
        name: yourReportName,
        query: {
          group: yourReportGroup,
        },
      }),
    });
    await job.save();
```

## Reference
### Configuration
The following environment variables can be configured:
* `MU_SPARQL_ENDPOINT` (default: http://database:8890/sparql): SPARQL endpoint of the internal triple store to read and write file and job records.
* `VIRTUOSO_SPARQL_ENDPOINT` (default: http://virtuoso:8890/sparql): SPARQL endpoint of the Virtuoso triple store, in order to download the csv files.
