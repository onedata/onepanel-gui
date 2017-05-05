import { validator } from 'ember-cp-validations';

/**
 * Creates an ``ember-cp-validations`` validators for given field specification
 * 
 * @param {FieldType} field
 * @returns {Array.Validator}
 */
export default function createFieldValidator(field) {
  let validations = [];
  if (!field.optional && field.type !== 'static') {
    validations.push(validator('presence', {
      presence: true,
      ignoreBlank: true,
    }));
  }
  if (field.type === 'number') {
    validations.push(validator('number', {
      allowString: true,
      allowBlank: field.optional,
      gte: field.gte,
      lte: field.lte,
      gt: field.gt,
      lt: field.lt,
    }));
  }
  return validations;
}
