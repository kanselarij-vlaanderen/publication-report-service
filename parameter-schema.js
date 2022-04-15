// The schema of the parameter config JSON
// This schema has 2 uses:
// - validation
// - documentation
// The schema is set up according to the JSON Schema specification:
//  -> see: https://json-schema.org/
// (if you're familiar with OpenAPI: it uses JSON Schema for its request bodies)
// The schema is used together with the library Ajv (which seems the goto)
//    -> see: https://ajv.js.org/guide/getting-started.html
// 2 extra validations* are added:
// see ./lib/json-schema.js
// - parse: validates and parses the JSON strings into JS Dates
// - dateRange: checks whether the date range is valid
//    - start date < end date
//    - a start date is required
// I could have used JSON, but JS seems a little easier for development

// How it works:
// validations are triggered based on the keys of the schema object e.g. type, properties,...: each key represents a validation check
// the keys values are the validation's parameters

const METRICS_GROUPS = ['government-domain', 'regulation-type', 'mandatee'];

export default {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: {
      type: 'string',
    },
    query: {
      type: 'object',
      required: ['group', 'filter'],
      additionalProperties: false,
      properties: {
        group: {
          type: 'string',
          enum: METRICS_GROUPS,
        },
        filter: {
          type: 'object',
          additionalProperties: false,
          properties: {
            publicationDate: {
              type: 'array',
              minItems: 2,
              maxItems: 2,
              range: {
                required: [true, false],
              },
              items: {
                parse: 'date',
              },
            },
            decisionDate: {
              type: 'array',
              minItems: 2,
              maxItems: 2,
              range: {
                required: [true, false],
              },
              items: {
                parse: 'date',
              },
            },
            isViaCouncilOfMinisters: {
              type: 'boolean',
            },

            regulationType: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
            },
            governmentDomain: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
            },
            mandatee: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  person: {
                    type: 'string',
                    format: 'uri',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
