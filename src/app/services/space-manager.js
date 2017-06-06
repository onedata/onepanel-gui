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

import SpaceDetails from 'onepanel-gui/models/space-details';

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
   * Fetch details of space support with given ID
   * 
   * @param {string} id
   * @return {ObjectPromiseProxy} resolves SpaceDetails object
   */
  getSpaceDetails(id) {
    let onepanelServer = this.get('onepanelServer');
    let promise = new Promise((resolve, reject) => {
      let req = onepanelServer.request('oneprovider', 'getSpaceDetails', id);
      req.then(({ data }) => resolve(SpaceDetails.create(data)));
      req.catch(reject);
    });
    return ObjectPromiseProxy.create({ promise });
  },

  /**
   * @param {string} id
   * @param {SpaceModifyRequest} spaceData fields of space to be changed
   * @param {StorageImportDetails} spaceData.storageImport
   * @param {StorageUpdateDetails} spaceData.storageUpdate
   */
  modifySpaceDetails(id, spaceData) {
    let onepanelServer = this.get('onepanelServer');
    let promise = new Promise((resolve, reject) => {
      let req =
        onepanelServer.request('oneprovider', 'modifySpace', id, spaceData);
      req.then(({ data }) => resolve(data));
      req.catch(reject);
    });
    return ObjectPromiseProxy.create({ promise });
  },

  /**
   * Support space in current provider using some storage
   * 
   * @param {Object} { size: Number, storageId: string, token: string, mountInRoot = false } 
   * @returns {Promise}
   */
  supportSpace(supportSpaceData) {
    let onepanelServer = this.get('onepanelServer');
    let supportReq = SpaceSupportRequest.constructFromObject(supportSpaceData);
    return onepanelServer.request('oneprovider', 'supportSpace', supportReq);
  },

  revokeSpaceSupport(spaceId) {
    let onepanelServer = this.get('onepanelServer');
    return onepanelServer.request('oneprovider', 'revokeSpaceSupport', spaceId);
  },

  /**
   * @param {string} spaceId 
   * @param {string} period one of: minute, hour, day
   * @param {Array.string} metrics array with any of: queueLength, insertCount,
   *  updateCount, deleteCount
   */
  getSyncStats(spaceId, period, metrics) {
    return new Promise((resolve, reject) => {
      let onepanelServer = this.get('onepanelServer');
      let gettingSyncStats = onepanelServer.request(
        'oneprovider',
        'getProviderSpaceSyncStats',
        spaceId, {
          period,
          metrics,
        }
      );

      gettingSyncStats.then(({ data }) => resolve(data));
      gettingSyncStats.catch(reject);
    });
  },
});
