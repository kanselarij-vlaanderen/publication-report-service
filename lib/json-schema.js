import Ajv from 'ajv';
import ajvAddFormats from 'ajv-formats';
import ParameterSchema from '../parameter-schema.js';

const keywordParse = {
  keyword: 'parse',
  modifying: true,
  valid: true,
  validate: validateParse,
};

function validateParse(keywordConfig, data, schema, validationCtx) {
  if (keywordConfig === 'date') {
    let date;
    let isValid = true;
    if (data === null) {
      date = null;
    } else {
      date = new Date(data);
      if (Number.isNaN(date)) {
        date = null;
        isValid = false;
        validateParse.errors = [
          {
            message: 'invalid date',
          },
        ];
      }
    }

    validationCtx.parentData[validationCtx.parentDataProperty] = date;
    return isValid;
  }
  throw new Error('unsupported');
}

const keywordRange = {
  keyword: 'range',
  validate: validateRange,
};

function validateRange(keywordConfig, array) {
  let isValid;
  const NAMES = ['start', 'end'];
  for (let i = 0; i < 2; ++i) {
    let isRequired = keywordConfig.required[i];
    if (isRequired && array[i] === null) {
      validateRange.errors = [
        {
          message: `${NAMES[i]} is required`,
        },
      ];
      return false;
    }
  }

  isValid = array[0] < array[1];
  if (!isValid) {
    validateRange.errors = [
      {
        message: 'start > end',
      },
    ];
    return false;
  }
  return true;
}

let ajv = new Ajv();
ajvAddFormats(ajv);

ajv.addKeyword(keywordParse);
ajv.addKeyword(keywordRange);

let validate = ajv.compile(ParameterSchema);

export function parse(jsonString) {
  let object = JSON.parse(jsonString);
  let isValid = validate(object);
  let errors = validate.errors;
  if (isValid) {
    return object;
  } else {
    throw errors;
  }
}
