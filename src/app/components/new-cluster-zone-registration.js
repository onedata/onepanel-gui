/**
 * A container for register provider form in installation steps
 *
 * @module components/new-cluster-zone-registration
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import Onepanel from 'npm:onepanel';
import stripObject from 'onedata-gui-common/utils/strip-object';
import { invokeAction } from 'ember-invoke-action';

const {
  inject: {
    service,
  },
  RSVP: {
    Promise,
  },
  Component,
} = Ember;

const {
  ProviderRegisterRequest,
} = Onepanel;

export default Component.extend({
  globalNotify: service(),
  onepanelServer: service(),

  /**
   * @param {Ember.Object} providerData data from provider registration form
   * @returns {Onepanel.ProviderRegisterRequest}
   */
  createProviderRegisterRequest(providerData) {
    let {
      name,
      onezoneDomainName,
      redirectionPoint,
      geoLongitude,
      geoLatitude,
    } = providerData.getProperties(
      'name',
      'onezoneDomainName',
      'redirectionPoint',
      'geoLongitude',
      'geoLatitude'
    );

    let reqProto = stripObject({
      name,
      onezoneDomainName,
      redirectionPoint,
      geoLongitude: Number.parseFloat(geoLongitude),
      geoLatitude: Number.parseFloat(geoLatitude),
    }, [undefined, null, NaN, '']);

    let req = ProviderRegisterRequest.constructFromObject(reqProto);

    return req;
  },

  /**
   * Use API to register provider
   * @param {Ember.Object} providerData 
   * @returns {Promise} resolves when provider was registered; otherwise rejects
   */
  _submit(providerData) {
    let submitting = new Promise((resolve, reject) => {
      let onepanelServer = this.get('onepanelServer');
      let providerRegisterRequest = this.createProviderRegisterRequest(providerData);
      let addingProvider =
        onepanelServer.request('oneprovider', 'addProvider',
          providerRegisterRequest);

      addingProvider.then(resolve, reject);
    });

    return submitting;
  },

  actions: {
    /**
     * Start registering provider
     * @param {Ember.Object} providerData 
     * @returns {Promise} ``_submit`` promise
     */
    submit(providerData) {
      let name = providerData.get('name');
      let submitting = this._submit(providerData);
      submitting.then(() => {
        // TODO i18n
        this.get('globalNotify').info('Provider registered successfully');
        invokeAction(this, 'changeClusterName', name);
        invokeAction(this, 'nextStep');
      });
      submitting.catch(error => {
        this.get('globalNotify').backendError(
          'provider registration',
          error
        );
      });
      return submitting;
    },
  },
});
