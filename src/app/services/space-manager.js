/**
 * Provides backend operations for spaces in onepanel
 *
 * @module services/space-manager
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import Onepanel from 'npm:onepanel';

const {
  A,
  Service,
  ObjectProxy,
  PromiseProxyMixin,
  inject: { service },
  RSVP: { Promise },
} = Ember;

const {
  SpaceSupportRequest
} = Onepanel;

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

      getSpaces.then(({ data: { ids } }) => {
        resolve(A(ids.map(id => this.getSpaceDetails(id))));
      });
      getSpaces.catch(reject);
    });

    return ObjectPromiseProxy.create({ promise });
  },

  /**
   * FIXME doc
   * 
   * @param {string} id
   * @return {ObjectPromiseProxy} resolves SpaceDetails object
   */
  getSpaceDetails(id) {
    let onepanelServer = this.get('onepanelServer');
    let promise = new Promise((resolve, reject) => {
      let req = onepanelServer.request('oneprovider', 'getSpaceDetails', id);
      req.then(({ data }) => resolve(data));
      req.catch(reject);
    });
    return ObjectPromiseProxy.create({ promise });
  },

  /**
   * FIXME doc
   * 
   * @param {Object} { size: Number, storageId: string, token: string, mountInRoot = false } 
   * @returns {Promise}
   */
  supportSpace({ size, storageId, token, mountInRoot = false }) {
    let onepanelServer = this.get('onepanelServer');
    let supportReq = SpaceSupportRequest.constructFromObject({
      size,
      storageId,
      token,
      mountInRoot,
    });
    return onepanelServer.request('oneprovider', 'supportSpace', supportReq);
  },

  revokeSpaceSupport(spaceId) {
    let onepanelServer = this.get('onepanelServer');
    return onepanelServer.request('oneprovider', 'revokeSpaceSupport', spaceId);
  },
});
