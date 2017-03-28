/**
 * Provides backend operations for spaces in onepanel
 *
 * @module services/space-manager
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  A,
  Service,
  ObjectProxy,
  PromiseProxyMixin,
  inject: { service },
  RSVP: { Promise },
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

export default Service.extend({
  onepanelServer: service(),

  /**
   * Fetch collection of onepanel SpaceDetails
   * 
   * @param {string} id
   * @return {ObjectPromiseProxy} resolves Ember.Array of SpaceDetails promise proxies
   */
  getSpaces() {
    let onepanelServer = this.get('onepanelServer');

    let promise = new Promise((resolve, reject) => {
      let getSpaces = onepanelServer.request('oneprovider', 'getProviderSpaces');
      getSpaces.then(({ ids }) => {
        resolve(A(ids.map(id => this.getSpaceDetails(id))));
      });
      getSpaces.catch(reject);
    });

    return ObjectPromiseProxy.create({ promise });
  },

  /**
   * 
   * 
   * @param {string} id
   * @return {ObjectPromiseProxy} resolves SpaceDetails object
   */
  getSpaceDetails(id) {
    let onepanelServer = this.get('onepanelServer');
    let promise = onepanelServer.request('oneprovider', 'getSpaceDetails', id);
    return ObjectPromiseProxy.create({ promise });
  },
});
