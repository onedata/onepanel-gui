/**
 * A base class for both real onepanel-server and mocked one (to avoid code redundancy)
 *
 * It should not be used as a standalone service! (thus it's name is "private")
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

    getClusterTypeFromUrl() {
      const m = this.get('_location').toString().match(reOnepanelInOnzoneUrl);
      return m && (m[1] === 'ozp' ? 'onezone' : 'oneprovider');
    },

    getClusterIdFromUrl() {
      const m = this.get('_location').toString().match(reOnepanelInOnzoneUrl);
      return m && m[2];
    },

    isStandalone: computed(function isStandalone() {
      return !this.getClusterIdFromUrl();
    }),

    // TODO: this is probably unneded abstraction layer in this service
    /**
     * Get hostname of this panel
     * @returns {Promise<string>}
     */
    getHostname() {
      return this.getNodeProxy()
        .then(({ hostname }) => hostname);
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
        .then(({ data: { hostname, componentType } }) => ({
          hostname,
          componentType,
        }));
    },
  }
);
