/**
 * A container for register provider form in installation steps
 *
 * @module components/new-cluster-zone-registration
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';

import { Promise } from 'rsvp';
import Component from '@ember/component';
import Onepanel from 'npm:onepanel';
import stripObject from 'onedata-gui-common/utils/strip-object';
import { invokeAction } from 'ember-invoke-action';
import getSubdomainReservedErrorMsg from 'onepanel-gui/utils/get-subdomain-reserved-error-msg';

const {
  ProviderRegisterRequest,
} = Onepanel;

const I18N_PREFIX = 'components.newClusterZoneRegistration.';

export default Component.extend({
  globalNotify: service(),
  onepanelServer: service(),
  i18n: service(),

  /**
   * Subdomains that are reserved and cannot be used
   * @type {Array<string>}
   */
  _excludedSubdomains: Object.freeze([]),

  /**
   * @param {Ember.Object} providerData data from provider registration form
   * @returns {Onepanel.ProviderRegisterRequest}
   */
  createProviderRegisterRequest(providerData) {
    let {
      token,
      name,
      onezoneDomainName,
      subdomainDelegation,
      subdomain,
      domain,
      geoLongitude,
      geoLatitude,
      adminEmail,
    } = providerData.getProperties(
      'token',
      'name',
      'onezoneDomainName',
      'subdomainDelegation',
      'subdomain',
      'domain',
      'geoLongitude',
      'geoLatitude',
      'adminEmail',
    );

    let reqProto = stripObject({
      token,
      name,
      onezoneDomainName,
      subdomainDelegation,
      subdomain,
      domain,
      adminEmail,
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
      let {
        globalNotify,
        _excludedSubdomains,
        i18n,
      } = this.getProperties('globalNotify', '_excludedSubdomains', 'i18n');
      let name = providerData.get('name');
      let submitting = this._submit(providerData);
      submitting.then(() => {
        globalNotify.info(i18n.t(I18N_PREFIX + 'providerRegisteredSuccessfully'));
        invokeAction(this, 'changeClusterName', name);
        invokeAction(this, 'nextStep');
      });
      submitting.catch(error => {
        const subdomainReservedMsg = getSubdomainReservedErrorMsg(error);
        if (subdomainReservedMsg) {
          this.set('_excludedSubdomains', _excludedSubdomains.concat(providerData.subdomain));
          error = { error: error.error, message: subdomainReservedMsg };
        }
        this.get('globalNotify').backendError(
          'provider registration',
          error
        );
      });
      return submitting;
    },
  },
});
