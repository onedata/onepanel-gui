/**
 * Basic information about supported space
 * 
 * @module components/space-overview
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get, getProperties } from '@ember/object';
import _ from 'lodash';
import spaceItemSupports from 'onepanel-gui/mixins/components/space-item-supports';
import { inject as service } from '@ember/service';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import Looper from 'onedata-gui-common/utils/looper';
import { fields as importFields } from 'onepanel-gui/components/storage-import-form';

export default Component.extend(I18n, spaceItemSupports, {
  i18nPrefix: 'components.spaceOverview',

  spaceManager: service(),
  storageManager: service(),

  /**
   * @virtual
   * @type {SpaceDetails}
   */
  space: undefined,

  /**
   * @virtual
   * @type {function}
   */
  submitModifySpace: notImplementedReject,

  /**
   * Interval in ms for updating space data.
   * @type {Number}
   */
  spaceUpdateInterval: 5000,

  /**
   * Updates space record to watch changes in space occupancy.
   * Initialized in init.
   * @type {Looper}
   */
  spaceUpdater: undefined,

  /**
   * List of storage import properties ready to show in template
   * @type {ComputedProperty<Array<{ name: string, label: string, value: any }>>}
   */
  importProperties: computed('space.{storageImport,content}', function () {
    let space = this.get('space');
    // support for ObjectProxy
    if (space != null && space.content != null) {
      space = space.get('content');
    }

    const {
      storageImport,
      storageImportEnabled,
      autoStorageImportEnabled,
      continuousImportScanEnabled,
    } = getProperties(
      space,
      'storageImport',
      'storageImportEnabled',
      'autoStorageImportEnabled',
      'continuousImportScanEnabled'
    );
    if (!storageImportEnabled) {
      return [];
    } else {
      const importConfig = Object.assign({ mode: storageImport.mode },
        (storageImport.scanConfig || {})
      );
      const properties = [];
      const fieldsPrefixes = ['mode'];
      if (autoStorageImportEnabled) {
        fieldsPrefixes.push('generic');
        if (continuousImportScanEnabled) {
          fieldsPrefixes.push('continuous');
        }
      }
      fieldsPrefixes.forEach(prefix => {
        const newProps = importFields[prefix]
          .mapBy('name')
          .filter(name => importConfig[name] !== undefined)
          .map(name => {
            return {
              name,
              label: this.t(`storageImport.${prefix}.${name}.name`),
              value: importConfig[name],
            };
          });
        properties.push(...newProps);
      });
      return properties;
    }
  }),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  _thisProviderSupportSize: computed(
    'spaceSupportersProxy.content',
    function () {
      const spaceSupporters = this.get('spaceSupportersProxy.content');
      if (typeof spaceSupporters === 'object') {
        const thisProviderSupport =
          _.find(spaceSupporters, { isCurrentProvider: true }) || {};
        return thisProviderSupport.size;
      } else {
        return undefined;
      }
    }
  ),

  /**
   * Space occupancy used to prepare used-space chart.
   * @type {Ember.ComputedProperty<number|undefined>}
   */
  _spaceOccupancy: computed(
    'space.spaceOccupancy',
    '_updatedSpaceOccupancy',
    function () {
      const preloadedSpaceOccupancy = this.get('space.spaceOccupancy');
      const _updatedSpaceOccupancy = this.get('_updatedSpaceOccupancy');
      return typeof _updatedSpaceOccupancy === 'number' ?
        _updatedSpaceOccupancy : preloadedSpaceOccupancy;
    }
  ),

  /**
   * Storage that supports space on this panel's provider
   * @type {PromiseObject}
   */
  _storage: computed('space.storageId', function () {
    let space = this.get('space');
    if (space) {
      let storageManager = this.get('storageManager');
      return storageManager.getStorageDetails(get(space, 'storageId'));
    }
  }),

  init() {
    this._super(...arguments);
    const spaceUpdateInterval = this.get('spaceUpdateInterval');
    const spaceUpdater = new Looper({
      immediate: true,
      interval: spaceUpdateInterval,
    });
    spaceUpdater.on('tick', () => this.updateSpace());
    this.set('spaceUpdater', spaceUpdater);
  },

  willDestroyElement() {
    try {
      const spaceUpdater = this.get('spaceUpdater');
      if (spaceUpdater) {
        spaceUpdater.destroy();
      }
    } finally {
      this._super(...arguments);
    }
  },

  updateSpace() {
    const spaceId = this.get('space.id');
    this.get('spaceManager').updateSpaceDetailsCache(spaceId);
  },

  actions: {
    submitModifySpace(data) {
      return this.get('submitModifySpace')(data);
    },
  },
});
