/**
 * A view to create, show or edit registered provider details
 *
 * @module components/provider-registration-form
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _object from 'lodash/object';
import OneFormSimple from 'onepanel-gui/components/one-form-simple';
import layout from 'onepanel-gui/templates/components/one-form-simple';
import { validator, buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onepanel-gui/utils/create-field-validator';
import Ember from 'ember';

const {
  computed,
  computed: { readOnly },
  observer,
  on,
} = Ember;

// TODO i18n
const FIELDS = {
  id: {
    name: 'id',
    type: 'static',
    placeholder: 'ID',
    _modeEdit: true,
  },
  name: {
    name: 'name',
    type: 'text',
    placeholder: 'Provider name',
    _modeNew: true,
    _modeEdit: true,
  },
  onezoneDomainName: {
    name: 'onezoneDomainName',
    type: 'text',
    placeholder: 'Onezone domain',
    _modeNew: true,
  },
  redirectionPoint: {
    name: 'redirectionPoint',
    type: 'text',
    placeholder: 'Redirection point',
    _modeNew: true,
    _modeEdit: true,
  },
  urls: {
    name: 'urls',
    type: 'static',
    placeholder: 'URLs',
    _modeEdit: true,
  },
  geoLatitude: {
    name: 'geoLatitude',
    type: 'number',
    placeholder: 'Latitude',
    step: 0.000001,
    optional: true,
    _modeNew: true,
    _modeEdit: true,
  },
  geoLongitude: {
    name: 'geoLongitude',
    type: 'number',
    placeholder: 'Longitude',
    step: 0.000001,
    optional: true,
    _modeNew: true,
    _modeEdit: true,
  },
};

const FIELDS_STATIC = {
  id: {
    name: 'id',
    type: 'static',
    placeholder: 'ID',
  },
  name: {
    name: 'name',
    type: 'static',
    placeholder: 'Provider name',
  },
  redirectionPoint: {
    name: 'redirectionPoint',
    type: 'static',
    placeholder: 'Redirection point',
  },
  urls: {
    name: 'urls',
    type: 'static',
    placeholder: 'URLs',
  },
  geoLatitude: {
    name: 'geoLatitude',
    type: 'static',
    placeholder: 'Latitude',
  },
  geoLongitude: {
    name: 'geoLongitude',
    type: 'static',
    placeholder: 'Longitude',
  },
};

const VALIDATIONS_PROTO = {};

// validations for fields in both new and edit modes
for (let fieldName in FIELDS) {
  let field = FIELDS[fieldName];
  if (field._modeEdit) {
    VALIDATIONS_PROTO[`allFieldsValues.main.${fieldName}`] =
      createFieldValidator(field);
  }
}

// validate onezoneDomainName only in "new" mode
VALIDATIONS_PROTO['allFieldsValues.main.onezoneDomainName'] = [
  validator('presence', {
    presence: true,
    ignoreBlank: true,
    disabled: computed('model.mode', function () {
      return this.get('model.mode') !== 'new';
    }),
  })
];

const Validations = buildValidations(VALIDATIONS_PROTO);

export default OneFormSimple.extend(Validations, {
  layout,

  classNames: ['provider-registration-form'],

  /**
   * To inject. One of: show, edit, new
   *
   * Use to set form to work in various contexts
   * @type {string}
   */
  mode: 'show',

  /**
   * To inject.
   * Contains provider registration info (like ``Onepanel.ProviderDetails``)
   * @type {Ember.Object}
   */
  provider: null,

  fields: computed('mode', function () {
    switch (this.get('mode')) {
    case 'new':
      return _object.values(FIELDS).filter(f => f._modeNew)
        .map(f => Ember.Object.create(f));
    case 'show':
      // in show mode, convert each field to static type    
      // TODO there are only text fields, so convert to static works  
      return _object.values(FIELDS_STATIC).map(f => Ember.Object.create(f));
    case 'edit':
      return _object.values(FIELDS).filter(f => f._modeEdit)
        .map(f => Ember.Object.create(f));

    default:
      break;
    }
  }),

  values: readOnly('provider'),

  submitButton: computed('mode', function () {
    let mode = this.get('mode');
    return mode !== 'show';
  }),

  // TODO i18n
  submitText: computed('mode', function () {
    let mode = this.get('mode');
    switch (mode) {
    case 'new':
      return 'Register';
    case 'edit':
      return 'Modify provider details';
    default:
      break;
    }
  }),

  flushValues: on('init', observer('mode', function () {
    this.updateValues();
  })),

  init() {
    this._super(...arguments);
  },

});
