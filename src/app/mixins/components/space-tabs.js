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
import { conditional, raw } from 'ember-awesome-macros';

const enabledClass = 'enabled';
const disabledClass = 'disabled';

export default Mixin.create({
  // requires i18n service
  // requires navigationState service

  selectedTab: undefined,

  tabOverviewClass: enabledClass,
  tabOverviewId: 'overview',
  tabOverviewHint: computedTabHint('overview'),

  tabSyncClass: conditional(
    'space.importEnabled',
    raw(enabledClass),
    raw(disabledClass)
  ),
  tabSyncId: 'sync',
  tabSyncHint: computedTabHint('sync'),

  tabPopularClass: enabledClass,
  tabPopularId: 'popular',
  tabPopularHint: computedTabHint('popular'),

  tabCleanClass: conditional(
    'filePopularityConfiguration.enabled',
    raw(enabledClass),
    raw(disabledClass)
  ),
  tabCleanId: 'clean',
  tabCleanHint: computedTabHint('clean'),

  changeTab(tabId) {
    return this.get('navigationState')
      .setAspectOptions({
        tab: tabId,
      });
  },

  actions: {
    changeTab(tabId) {
      return this.changeTab(tabId);
    },
  },
});

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
