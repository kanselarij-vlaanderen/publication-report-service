# Scope of this document
The service is currently conceived in such a way to allow any combination of filters options with any of the types to group by.
However the UI bundles 6 of these combinations as PublicationReportTypes. This document describes the matching filter options and group option by for each PublciationReportType.
Because a change might be required that restricts the combinations, this document documents the combinations in use by the frontend. When we choose a less dynamic approach, it might be useful to consider grouping and preset filters can be moved to SPARQL directly.

In order to understand the filter options and group options, please consult the **Reference** section [README.md](../README.md).

In order to add a PublicationReportType define it in [app-kaleidos](https://github.com/kanselarij-vlaanderen/app-kaleidos)

## Publication report types
- `<http://themis.vlaanderen.be/id/concept/by-mandatees-on-decision-date>`:
  - **group by**: group of mandatee-persons
  - **filter on**:
    - decision-date range: user input, from required, end optional
- `<http://themis.vlaanderen.be/id/concept/by-mandatees-only-bvr>`:
  - **group by**: group of mandatee-persons
  - **filter on**:
    - regulation type: preset: BVR
    - publication-year: user input, required
    - mandatee-persons: user input, optional, multiple
- `<http://themis.vlaanderen.be/id/concept/by-mandatees-only-decree>`:
  - **group by**: group of mandatee-persons
  - **filter on**:
    - regulation-type: preset: decreet
    - publication-year: user input, required
    - mandatee-persons: user-input, optional, multiple
- `<http://themis.vlaanderen.be/id/concept/by-government-domains>`:
  - **group by**: group of government-domains
  - **filter on**:
    - publication-year: user input, required
    - government-domains: user input, optional, multiple
- `<http://themis.vlaanderen.be/id/concept/by-regulation-type>`:
  - **group by**: regulation-type
  - **filter on**:
    - publication-year: user-input, required
- `<http://themis.vlaanderen.be/id/concept/by-regulation-type-only-not-via-council-of-ministers>`:
  - **group by**: regulation-type
  - **filter on**:
    - is-via-council-of-ministers: preset: no
    - publication-year: user-input, required
    - regulation-type: user-input, optional