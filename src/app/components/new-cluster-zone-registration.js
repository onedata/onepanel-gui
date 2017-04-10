/**
 * View form registering oneprovider in onezone 
 *
 * @module components/new-cluster-zone-registration
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import Onepanel from 'npm:onepanel';
import { validator, buildValidations } from 'ember-cp-validations';
import OneForm from 'onepanel-gui/components/one-form';
import stripObject from 'onepanel-gui/utils/strip-object';

const {
  inject: {
    service
  },
  computed,
  RSVP: {
    Promise
  }
} = Ember;

const {
  ProviderRegisterRequest
} = Onepanel;

const FIELDS = [
  { name: 'name', type: 'text' },
  { name: 'onezoneDomainName', type: 'text' },
  { name: 'redirectionPoint', type: 'text' },
  { name: 'geoLatitude', type: 'number', step: 0.000001, optional: true },
  { name: 'geoLongitude', type: 'number', step: 0.000001, optional: true },
];

function createValidations(fields) {
  let validations = {};
    fields.forEach(field => {
      let fieldName = 'allFieldsValues.main.' + field.name;
      validations[fieldName] = [];
      if (!field.optional) {
        validations[fieldName].push(validator('presence', true));
      }
    });
  return validations;
}

const Validations = buildValidations(createValidations(FIELDS));

export default OneForm.extend(Validations, {
  unknownFieldErrorMsg: 'component:cluster-storage-add-form: attempt to change not known input type',
  currentFieldsPrefix: 'main',
  currentFields: computed.alias('allFields'),
  allFields: null,
  allFieldsValues: computed('allFields', function () {
    let {
      allFields
    } = this.getProperties('allFields');
    let fields = Ember.Object.create({});
    fields.set('main', Ember.Object.create({}));
    allFields.forEach(field => {
      fields.set('main.' + field.get('name'), null);
    });
    return fields;
  }),
  formValues: computed.alias('allFieldsValues.main'),
  globalNotify: service(),
  onepanelServer: service(),

  _isBusy: false,

  init() {
    let i18n = this.get('i18n');
    this._super(...arguments);
    this.set('allFields', FIELDS.map(field => Ember.Object.create(field)));
    this.get('allFields').forEach(field => field.set(
      'placeholder', i18n.t(`components.newClusterZoneRegistration.fields.${field.get('name')}`)));
    this.prepareFields();
  },

  createProviderRegisterRequest() {
    let {
      name,
      onezoneDomainName,
      redirectionPoint,
      geoLongitude,
      geoLatitude,
    } = this.get('formValues').getProperties(
      this.get('currentFields').map(f => f.get('name')));

    let reqProto = stripObject({
      name,
      onezoneDomainName,
      redirectionPoint,
      geoLongitude: Number.parseFloat(geoLongitude),
      geoLatitude: Number.parseFloat(geoLatitude)
    }, [undefined, null, NaN, '']);

    let req = ProviderRegisterRequest.constructFromObject(reqProto);

    return req;
  },

  _submit() {
    let submitting = new Promise((resolve, reject) => {
      let onepanelServer = this.get('onepanelServer');
      // TODO validate
      // TODO use api to submit
      let providerRegisterRequest = this.createProviderRegisterRequest();
      let addingProvider =
        onepanelServer.request('oneprovider', 'addProvider',
          providerRegisterRequest);

      addingProvider.then(resolve, reject);
    });

    return submitting;
  },

  actions: {
    inputChanged(inputType, value) {
      this.changeFormValue(inputType, value);
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },

    submit() {
      let submitting = this._submit();
      this.set('_isBusy', true);
      submitting.then(() => {
        // TODO i18n
        this.get('globalNotify').info('Provider registered successfully');
        this.sendAction('nextStep');
      });
      submitting.catch(error => {
        this.get('globalNotify').error(
          'Could not register the provider in zone: ' + error
        );
      });
      submitting.finally(() => this.set('_isBusy', false));
      return submitting;
    }
  }
});
