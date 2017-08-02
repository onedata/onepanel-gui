/**
 * Adds a validation of backend response data
 *
 * See VALIDATORS const to add a validator for specific api method reponse
 * Validator functions are stored in ``utils/response-validators/``
 *
 * @module mixins/response-validator
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import getZoneConfiguration from 'ember-onedata-onepanel-server/utils/response-validators/onezone/get-zone-configuration';
import getProviderConfiguration from 'ember-onedata-onepanel-server/utils/response-validators/oneprovider/get-provider-configuration';

const {
  Mixin,
} = Ember;

/**
 * Contains <api> -> <method> -> <validation function> mapping
 * @type {object}
 */
const VALIDATORS = {
  onezone: {
    getZoneConfiguration,
  },
  oneprovider: {
    getProviderConfiguration,
  }
};

export default Mixin.create({
  init() {
    this._super(...arguments);
  },

  /**
   * Check if backend response can be used by frontend
   *
   * @returns {any|null} if data is not valid, return error message
   */
  validateResponseData(api, method, data) {
    if (VALIDATORS.hasOwnProperty(api) && VALIDATORS[api].hasOwnProperty(method)) {
      return VALIDATORS[api][method](data);
    } else {
      return true;
    }
  },
});
