/**
 * Adds tools for rendering tabs in space view 
 *
 * @module mixins/components/space-tabs
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { camelize } from '@ember/string';

const enabledClass = 'enabled';
const disabledClass = 'disabled';

export default Mixin.create({
  // requires i18n service

  selectedTab: undefined,

  tabOverviewClass: enabledClass,
  tabOverviewId: computedTabId('overview'),
  tabOverviewHint: computedTabHint('overview'),

  tabSyncClass: enabledClass,
  tabSyncId: computedTabId('sync'),
  tabSyncHint: computedTabHint('sync'),

  tabPopularClass: enabledClass,
  tabPopularId: computedTabId('popular'),
  tabPopularHint: computedTabHint('popular'),

  tabCleanClass: computed('filePopularityConfiguration.enabled', function () {
    return this.get('filePopularityConfiguration.enabled') ? enabledClass :
      disabledClass;
  }),
  tabCleanId: computedTabId('clean'),
  tabCleanHint: computedTabHint('clean'),

  init() {
    this._super(...arguments);
    if (this.get('selectedTab') == null) {
      this.set('selectedTab', this.get('tabOverviewId'));
    }
  },

  actions: {
    changeTab(tabId) {
      const spaceId = this.get('space.id');
      return this.get('router').transitionTo({
        queryParams: {
          options: `space.${spaceId},tab.${tabId}`,
        },
      });
    },
  },
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
      .t(`mixins.components.spaceTabs.tabs.${tab}.hints.${classValue}`);
  });
}
