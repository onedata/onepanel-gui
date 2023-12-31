/**
 * Adds a validation of backend response data
 *
 * See `validators` property to add a validator for specific api method response
 * Validator functions are stored in `utils/response-validators/`
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';

import { Promise } from 'rsvp';
import { htmlSafe } from '@ember/string';

import getZoneConfiguration from 'ember-onedata-onepanel-server/utils/response-validators/onezone/get-zone-configuration';
import getProviderConfiguration from 'ember-onedata-onepanel-server/utils/response-validators/oneprovider/get-provider-configuration';
import getProvider from 'ember-onedata-onepanel-server/utils/response-validators/oneprovider/get-provider';
import getClusterHosts from 'ember-onedata-onepanel-server/utils/response-validators/onepanel/get-cluster-hosts';
import getProviderSpaces from 'ember-onedata-onepanel-server/utils/response-validators/oneprovider/get-provider-spaces';
import getSpaceDetails from 'ember-onedata-onepanel-server/utils/response-validators/oneprovider/get-space-details';
import getStorages from 'ember-onedata-onepanel-server/utils/response-validators/oneprovider/get-storages';
import getStorageDetails from 'ember-onedata-onepanel-server/utils/response-validators/oneprovider/get-storage-details';
import getProviderSpaceAutoCleaningReports from 'ember-onedata-onepanel-server/utils/response-validators/oneprovider/get-provider-space-auto-cleaning-reports';
import getProviderSpaceAutoCleaningStatus from 'ember-onedata-onepanel-server/utils/response-validators/oneprovider/get-provider-space-auto-cleaning-status';

export default Mixin.create({
  /**
   * Contains `<api> -> <method> -> <validation function>` mapping
   * @type {Object}
   */
  validators: Object.freeze({
    ClusterApi: {
      getClusterHosts,
    },
    OnezoneClusterApi: {
      getZoneConfiguration,
    },
    OneproviderClusterApi: {
      getProviderConfiguration,
    },
    OneproviderIdentityApi: {
      getProvider,
    },
    SpaceSupportApi: {
      getProviderSpaces,
      getSpaceDetails,
    },
    StoragesApi: {
      getStorages,
      getStorageDetails,
    },
    AutoCleaningApi: {
      getProviderSpaceAutoCleaningReports,
      getProviderSpaceAutoCleaningStatus,
    },
  }),

  /**
   * See eg. onepanel-server for implementation
   * @virtual
   * @returns {Promise}
   */
  request() {
    throw new Error('not implemented');
  },

  /**
   * Check if backend response can be used by frontend
   *
   * @param {string} api name as defined in Onepanel JS client (`new Onepanel.<NameApi>`)
   * @param {string} method onepanel API method name
   * @param {string} data response data of remote method call
   * @returns {any|null} if data is not valid, return error message
   */
  validateResponseData(api, method, data) {
    const validators = this.get('validators');
    if (validators.hasOwnProperty(api) && validators[api].hasOwnProperty(method)) {
      return validators[api][method](data);
    } else {
      console.warn(
        `responseValidator: validator function not found for: ${api}/${method}`
      );
      return true;
    }
  },

  /**
   * Makes a request that requires valid data to be fetched
   *
   * This is version of a request that rejects on invalid data returned
   *
   * @param {string} api
   * @param {string} method
   * @param {any} params
   * @returns {Promise}
   */
  requestValidData(api, method, ...params) {
    return this.request(api, method, ...params).then(
      (responseInfo) => {
        return new Promise((resolve, reject) => {
          if (this.validateResponseData(api, method, responseInfo.data)) {
            resolve(responseInfo);
          } else {
            let responseData;
            try {
              responseData = JSON.stringify(responseInfo.data);
            } catch (error) {
              console.warn(
                `Cannot parse invalid response data from ${api}/${method}`);
            }

            reject({
              message: htmlSafe(
                `<p>Server method <code>${api}/${method}</code> provided incomplete or invalid data</p> <code>${responseData}</code>`
              ),
            });
          }
        });
      });
  },
});
