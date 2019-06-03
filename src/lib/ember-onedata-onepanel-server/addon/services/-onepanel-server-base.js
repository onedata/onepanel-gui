/**
 * A base class for both real onepanel-server and mocked one (to avoid code redundancy)
 *
 * It should not be used as a emergency service! (thus it's name is "private")
 *
 * @module services/-onepanel-server-base
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import RequestErrorHandler from 'ember-onedata-onepanel-server/mixins/request-error-handler';
import ResponseValidator from 'ember-onedata-onepanel-server/mixins/response-validator';
import { computed } from '@ember/object';
import { not } from '@ember/object/computed';
import { resolve } from 'rsvp';

export const reOnepanelInOnzoneUrl = /.*\/(opp|ozp)\/(.*?)\/(.*)/;

export default Service.extend(
  RequestErrorHandler,
  ResponseValidator,
  createDataProxyMixin('configuration'),
  createDataProxyMixin('node'), {
    /**
     * @type {Window.Location}
     */
    _location: location,

    isHosted: not('isEmergency'),

    isEmergency: computed(function isEmergency() {
      return !this.getClusterIdFromUrl();
    }),

    getClusterTypeFromUrl() {
      const m = this.get('_location').toString().match(reOnepanelInOnzoneUrl);
      return m && (m[1] === 'ozp' ? 'onezone' : 'oneprovider');
    },

    getClusterIdFromUrl() {
      const m = this.get('_location').toString().match(reOnepanelInOnzoneUrl);
      return m && m[2];
    },

    /**
     * @override
     * Fetches configuration
     * @returns {Promise<Object>}
     */
    fetchConfiguration() {
      return this.staticRequest('onepanel', 'getConfiguration')
        .then(({ data }) => data);
    },

    /**
     * @override
     */
    fetchNode() {
      return this.staticRequest('onepanel', 'getNode')
        .then(({ data: { hostname, clusterType } }) => ({
          hostname,
          clusterType,
        }));
    },

    /**
     * Returns promise that resolves to current user details
     * @returns {Promise<Onepanel.UserDetails>}
     */
    getCurrentUser() {
      const isEmergency = this.get('isEmergency');

      if (isEmergency) {
        // root account
        return resolve({
          userId: 'root',
          username: 'root',
          clusterPrivileges: [
            'cluster_view',
            'cluster_update',
            'cluster_delete',
            'cluster_view_privileges',
            'cluster_set_privileges',
            'cluster_add_user',
            'cluster_remove_user',
            'cluster_add_group',
            'cluster_remove_group',
          ],
        });
      } else {
        return this.request('onepanel', 'getCurrentUser')
          .then(({ data }) => data);
      }
    },
  }
);
