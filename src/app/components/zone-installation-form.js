import OneFormSimple from 'onepanel-gui/components/one-form-simple';
import layout from 'onepanel-gui/templates/components/one-form-simple';
import { validator, buildValidations } from 'ember-cp-validations';
import { invokeAction } from 'ember-invoke-action';

const FORM_FIELDS = [{
  name: 'name',
  type: 'text',
  placeholder: 'Zone name'
}];

const Validations = buildValidations({
  'allFieldsValues.main.name': [
    validator('presence', {
      presence: true,
      allowBlank: false,
    }),
  ]
});

export default OneFormSimple.extend(Validations, {
  layout,

  fields: FORM_FIELDS,
  submitButton: false,

  actions: {
    inputChanged(fieldName, value) {
      this._super(...arguments);
      invokeAction(this, 'zoneFormChanged', fieldName, value);
    },
  }
});
