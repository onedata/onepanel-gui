/**
 * Adds tools for rendering tabs in space view 
 *
 * @module mixins/components/space-tabs
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { camelize } from '@ember/string';
import _ from 'lodash';

const ENABLED_CLASS = 'enabled';
const DISABLED_CLASS = 'disabled';

export default Mixin.create({
  // requires i18n service

  /**
   * Store active tab (updated on bs-tab change action)
   * @type {string}
   */
  activeTabId: undefined,

  tabSyncClass: computed('space.importEnabled', function () {
    return this.get('space.importEnabled') ? ENABLED_CLASS : DISABLED_CLASS;
  }),
  tabSyncId: computedTabId('sync'),
  tabSyncHint: computedTabHint('sync'),

  tabPopularClass: ENABLED_CLASS,
  tabPopularId: computedTabId('popular'),
  tabPopularHint: computedTabHint('popular'),

  tabCleanClass: computed('filesPopularityConfiguration.enabled', function () {
    return this.get('filesPopularityConfiguration.enabled') ? ENABLED_CLASS :
      DISABLED_CLASS;
  }),
  tabCleanId: computedTabId('clean'),
  tabCleanHint: computedTabHint('clean'),

  _allTabsIdComputed: computed('tabSyncId', 'tabPopularId', 'tabCleanId', function () {
    return _.every(this.getProperties(
      'tabSyncId',
      'tabPopularId',
      'tabCleanId',
    ));
  }),

  initActiveTabId: computed('_allTabsIdComputed', function () {
    let _initActiveTabId = this.get('_initActiveTabId');
    if (_initActiveTabId) {
      return _initActiveTabId;
    } else if (this.get('_allTabsIdComputed')) {
      const activeTabShort = _.find(['sync', 'popular', 'clean'], tab =>
        this.get(camelize(`tab-${tab}-class`)) === ENABLED_CLASS
      );
      _initActiveTabId = this.get(camelize(`tab-${activeTabShort}-id`));
      this.set('_initActiveTabId', _initActiveTabId);
      // using side effect to not use observer (should be fired only once)
      this.set('activeTabId', _initActiveTabId);
      return _initActiveTabId;
    }
  }),
});

/**
 * Create computed property that will return an ID for tab
 * @param {string} tab one of: sync, popular, clean
 * @returns {Ember.ComputedProperty}
 */
function computedTabId(tab) {
  return computed('space.id', function () {
    return `tab-${tab}-${this.get('space.id')}`;
  });
}

/**
 * Create computed property that will return translated hint for tab
 * @param {string} tab one of: sync, popular, clean
 * @returns {Ember.ComputedProperty}
 */
function computedTabHint(tab) {
  const classProperty = camelize(`tab-${tab}-class`);
  return computed(classProperty, function () {
    const classValue = this.get(classProperty);
    return this.get('i18n')
      .t(`components.clusterSpacesTableItem.tabs.${tab}.hints.${classValue}`);
  });
}
