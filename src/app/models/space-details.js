/**
 * A wrapper for Onepanel.SpaceDetails type
 *
 * Initialize with Onepanel.SpaceDetails object, eg.
 * ```
 * let sd = SpaceDetails.create(spaceDetails)
 * ```
 *
 * @module models/space-details
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';

export default EmberObject.extend({
  /**
   * @type {string}
   */
  id: null,

  /**
   * @type {string}
   */
  name: null,

  /**
   * @type {string}
   */
  storageId: null,

  /**
   * Maps: provider id (string) -> support size (number)
   * @type {object}
   */
  supportingProviders: null,

  /**
   * @type {Onepanel.StorageImport}
   */
  storageImport: null,

  /**
   * @type {Onepanel.StorageUpdate}
   */
  storageUpdate: null,

  importEnabled: computed('storageImport.strategy', function () {
    let strategy = this.get('storageImport.strategy');
    return strategy != null && strategy !== 'no_import';
  }),

  updateEnabled: computed('storageUpdate.strategy', function () {
    let strategy = this.get('storageUpdate.strategy');
    return strategy != null && strategy !== 'no_update';
  }),

  continuousImportEnabled: reads('updateEnabled'),

  /**
   * Space size.
   * @type {computed.number}
   */
  spaceSize: computed('supportingProviders', function () {
    let providers = this.get('supportingProviders');
    if (providers) {
      return Object.keys(providers)
        .reduce((sum, id) => sum + get(providers, id), 0);
    } else {
      return 0;
    }
  }),
});
