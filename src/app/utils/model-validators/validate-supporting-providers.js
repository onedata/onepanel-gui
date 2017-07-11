/**
 * Validates supportingProviders property of ``onepanel.SpaceDetails`` 
 *
 * @module utils/model-validators/supporting-providers-validator
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

/**
 * @export
 * @param {Object} supportingProviders providerId: string -> supportSize: number mapping
 * @returns {boolean} true if supportingProviders object can be consumed by frontend
 */
export default function modelValidatorsSupportingProviders(supportingProviders) {
  return _.isObjectLike(supportingProviders) && !_.isEmpty(supportingProviders);
}
