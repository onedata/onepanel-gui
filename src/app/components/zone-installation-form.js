/**
 * Additional options for zone deployment
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneFormSimple from 'onedata-gui-common/components/one-form-simple';
import layout from 'onedata-gui-common/templates/components/one-form-simple';
import { buildValidations } from 'ember-cp-validations';
import _array from 'lodash/array';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import globals from 'onedata-gui-common/utils/globals';

// TODO i18n
const FORM_FIELDS = [{
    name: 'name',
    type: 'text',
    label: 'Onezone name',
    example: 'My Onezone',
    tip: 'The name for this zone, typically corresponding to ' +
      'organizational unit where it operates.',
  },
  {
    name: 'domainName',
    type: 'text',
    label: 'Onezone domain name',
    example: globals.location.hostname,
    tip: 'The domain of this Onezone as seen by the users, the same as ' +
      'the domain name in your web server SSL certificates. ' +
      'Required for proper functioning of Onezone server.',
  },
];

const Validations = buildValidations(
  _array.zipObject(
    FORM_FIELDS.map(f => `allFieldsValues.main.${f.name}`),
    FORM_FIELDS.map(field => createFieldValidator(field))
  )
);

export default OneFormSimple.extend(Validations, {
  layout,

  /**
   * @virtual
   * @type {(fieldName: string, value: any) => void}
   */
  zoneFormChanged: undefined,

  fields: FORM_FIELDS,
  submitButton: false,

  actions: {
    inputChanged(fieldName, value) {
      this._super(...arguments);
      const zoneFormChanged = this.get('zoneFormChanged');
      if (zoneFormChanged) {
        zoneFormChanged(fieldName, value);
      }
    },
  },
});
