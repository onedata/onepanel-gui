/**
 * A base class for both real onepanel-server and mocked one (to avoid code redundancy)
 *
 * It should not be used as a emergency service! (thus it's name is "private")
 *
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
import { getOwner } from '@ember/application';

export default Service.extend(
  RequestErrorHandler,
  ResponseValidator,
  createDataProxyMixin('configuration'),
  createDataProxyMixin('node'), {
    /**
     * False if op-worker and/or oz-worker are not available
     * @type {boolean}
     */
    workerServicesAreAvailable: true,

    isHosted: not('isEmergency'),

    guiContextProxy: computed(function guiContextProxy() {
      return getOwner(this).application.guiContextProxy;
    }),

    guiContext: computed(function guiContext() {
      return getOwner(this).application.guiContext;
    }),

    isEmergency: computed(function isEmergency() {
      return this.get('guiContext.guiMode') === 'emergency';
    }),

    /**
     * @override
     * Fetches configuration
     * @returns {Promise<Object>}
     */
    fetchConfiguration() {
      return this.staticRequest('ClusterApi', 'getConfiguration')
        .then(({ data }) => data);
    },

    /**
     * @override
     */
    fetchNode() {
      return this.staticRequest('ClusterApi', 'getNode')
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
        return this.request('CurrentUserApi', 'getCurrentUser')
          .then(({ data }) => data);
      }
    },
  }
);
