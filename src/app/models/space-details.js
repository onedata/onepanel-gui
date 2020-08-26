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
import { and, equal, raw, or } from 'ember-awesome-macros';

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
   * @type {ComputedProperty<boolean>}
   */
  autoStorageImportEnabled: equal('storageImport.mode', raw('auto')),

  /**
   * @type {ComputedProperty<boolean>}
   */
  manualStorageImportEnabled: equal('storageImport.mode', raw('manual')),

  /**
   * @type {ComputedProperty<boolean>}
   */
  storageImportEnabled: or(
    'autoStorageImportEnabled',
    'manualStorageImportEnabled'
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  continuousImportScanEnabled: and(
    'autoStorageImportEnabled',
    'storageImport.scanConfig.continuousScan'
  ),

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
