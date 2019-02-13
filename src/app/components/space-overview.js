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
import { computed, get } from '@ember/object';
import _ from 'lodash';
import spaceItemSupports from 'onepanel-gui/mixins/components/space-item-supports';
import { inject as service } from '@ember/service';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

/**
 * Space's `storageImport` properties that shouldn't be listed as generic
 * properties (can be handled separately)
 * @type {Array.string}
 */
const SKIPPED_IMPORT_PROPERTIES = ['strategy'];

/**
 * Space's `storageUpdate` properties that shouldn't be listed as generic
 * properties (can be handled separately)
 * @type {Array.string}
 */
const SKIPPED_UPDATE_PROPERTIES = ['strategy'];

export default Component.extend(I18n, spaceItemSupports, {
  i18nPrefix: 'components.spaceOverview',

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

  importStrategyLabel: computed('space.storageImport.strategy', function () {
    let i18n = this.get('i18n');
    const i18nPrefix = this.get('i18nPrefix');
    let strategy = this.get('space.storageImport.strategy');
    return i18n.t(`${i18nPrefix}.storageImport.strategies.${strategy}`);
  }),

  updateStrategyLabel: computed('space.storageUpdate.strategy', function () {
    let i18n = this.get('i18n');
    const i18nPrefix = this.get('i18nPrefix');
    let strategy = this.get('space.storageUpdate.strategy');
    return i18n.t(`${i18nPrefix}.storageUpdate.strategies.${strategy}`);
  }),

  /**
   * List of specific non-empty, type-specific storage import properties
   * @type {Array}
   */
  importProperties: computed('space.{storageImport,content}', function () {
    let space = this.get('space');
    // support for ObjectProxy
    if (space != null && space.content != null) {
      space = space.get('content');
    }
    let storageImport = get(space, 'storageImport');
    return storageImport != null ?
      Object.keys(storageImport).filter(p =>
        get(storageImport, p) != null && !_.includes(
          SKIPPED_IMPORT_PROPERTIES, p)
      ) : [];
  }),

  /**
   * List of specific non-empty, type-specific storage update properties
   * @type {Array}
   */
  updateProperties: computed('space.{storageUpdate,content}', function () {
    let space = this.get('space');
    // support for ObjectProxy
    if (space != null && space.content != null) {
      space = space.get('content');
    }
    let storageUpdate = get(space, 'storageUpdate');
    return storageUpdate != null ?
      Object.keys(storageUpdate).filter(p =>
        get(storageUpdate, p) != null && !_.includes(
          SKIPPED_UPDATE_PROPERTIES, p)
      ) : [];
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

  actions: {
    submitModifySpace(data) {
      return this.get('submitModifySpace')(data);
    },
  },
});
