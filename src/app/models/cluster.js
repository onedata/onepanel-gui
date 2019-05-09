/**
 * Additional computed properties for backend and cluster-model-manager cluster
 * data.
 * 
 * @module models/cluster
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import checkImg from 'onedata-gui-common/utils/check-img';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { resolve } from 'rsvp';

export default EmberObject.extend(createDataProxyMixin('isOnline'), {
  /**
   * @virtual
   * @type {string|ComputedProperty<string>}
   */
  domain: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isLocal: undefined,

  standaloneOrigin: computed('domain', function standaloneOrigin() {
    return `https://${this.get('domain')}:9443`;
  }),

  /**
   * @override
   */
  fetchIsOnline() {
    if (this.get('isLocal')) {
      return resolve(true);
    } else {
      const origin = this.get('standaloneOrigin');
      return checkImg(`${origin}/favicon.ico`);
    }
  },
});
