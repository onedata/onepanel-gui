// FIXME: jsdoc

import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';

const ENABLED = 'enabled';
const DISABLED = 'disabled';
const LOADING = 'disabled loading';

export default Mixin.create({
  tabSyncClass: computed('importEnabled', function () {
    return this.get('importEnabled') ? ENABLED : DISABLED;
  }),

  tabSyncId: computedTabId('sync'),

  tabPopularClass: computed('filesPopularity.enabled', function () {
    return this.get('filesPopularity.enabled') ? ENABLED : DISABLED;
  }),

  tabPopularId: computedTabId('popular'),

  tabCleanClass: computed('autoCleaningLoading', 'autoCleaning.enabled', function () {
    if (this.get('autoCleaningLoading')) {
      return LOADING;
    } else {
      return this.get('autoCleaning.enabled') ? ENABLED : DISABLED;
    }
  }),

  tabCleanId: computedTabId('clean'),
});

/**
 * Create computed property that will return an ID for tab
 * @param {string} tab 
 * @returns {Ember.ComputedProperty}
 */
function computedTabId(tab) {
  return computed('space.id', function () {
    return `tab-${tab}-${this.get('space.id')}`;
  });
}
