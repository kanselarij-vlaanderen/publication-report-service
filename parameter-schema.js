// The schema of the parameter config JSON
// This schema has 2 uses:
// - validation
// - documentation
// The schema is set up according to the JSON Schema specification:
//  -> see: https://json-schema.org/
// (if you're familiar with OpenAPI: it uses JSON Schema for its request bodies)
// The schema is used together with the library Ajv (which seems the goto)
//    -> see: https://ajv.js.org/guide/getting-started.html
// I could have used JSON, but JS seems a little easier for development

// How it works:
// validations are triggered based on the keys of the schema object e.g. type, properties,...: each key represents a validation check
// the keys values are the validation's parameters
// a schema can contain subschema's: as a value of the properties validation (for objects) and as value of the items key for array

const METRICS_GROUPS = [
  'governmentDomains',
  'regulationType',
  'mandateePersons',
];

export default {
  type: 'object',
  additionalProperties: false,
  properties: {
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
              items: {
                type: 'string',
                format: 'date-time',
                nullable: true,
              },
            },
            decisionDate: {
              type: 'array',
              minItems: 2,
              maxItems: 2,
              items: {
                type: 'string',
                format: 'date-time',
                nullable: true,
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
            governmentDomains: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
            },
            mandateePersons: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
            },
          },
        },
      },
    },
  },
};
