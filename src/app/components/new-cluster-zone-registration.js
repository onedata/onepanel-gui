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
// TODO use ember-bootstrap form.element and cp-validations addon
// import { validator, buildValidations } from 'ember-cp-validations';

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

const INPUT_NAMES = FIELDS.map(f => f.name);

// TODO use ember-bootstrap form.element and cp-validations addon
// let Validations = buildValidations({
//   name: validator('presence', true),
//   onezoneDomainName: validator('presence', true),
//   redirectionPoint: validator('presence', true),
// });

function isKnownInputType(type) {
  return INPUT_NAMES.indexOf(type) !== -1;
}

export default Ember.Component.extend({
  globalNotify: service(),
  onepanelServer: service(),

  formValues: Ember.Object.create({
    name: null,
    onezoneDomainName: null,
    redirectionPoint: null,
    geoLatitude: null,
    geoLongitude: null,
  }),

  _isBusy: false,

  fields: computed(() => FIELDS).readOnly(),

  init() {
    let i18n = this.get('i18n');
    this._super(...arguments);
    FIELDS.forEach(f =>
      f.placeholder = i18n.t(`components.newClusterZoneRegistration.fields.${f.name}`)
    );
  },

  createProviderRegisterRequest() {
    let {
      name,
      onezoneDomainName,
      redirectionPoint,
      geoLongitude,
      geoLatitude,
    } = this.get('formValues').getProperties(...INPUT_NAMES);

    let req = ProviderRegisterRequest.constructFromObject({
      name,
      onezoneDomainName,
      redirectionPoint,
      geoLongitude: Number.parseFloat(geoLongitude),
      geoLatitude: Number.parseFloat(geoLatitude),
    });

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
      if (isKnownInputType(inputType)) {
        this.get('formValues').set(inputType, value);
      } else {
        console.warn(
          'component:new-cluster-zone-registration: attempt to change not known input type'
        );
      }
    },

    submit() {
      let submitting = this._submit();
      this.set('_isBusy', true);
      submitting.then(() => {
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
