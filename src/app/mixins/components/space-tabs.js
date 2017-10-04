// FIXME: jsdoc

import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { camelize } from '@ember/string';
import _ from 'lodash';

const ENABLED = 'enabled';
const DISABLED = 'disabled';

export default Mixin.create({
  tabSyncClass: computed('space.importEnabled', function () {
    return this.get('space.importEnabled') ? ENABLED : DISABLED;
  }),

  tabSyncId: computedTabId('sync'),

  tabPopularClass: 'enabled',

  tabPopularId: computedTabId('popular'),

  tabCleanClass: computed('filesPopularity.enabled', function () {
    return this.get('filesPopularity.enabled') ? ENABLED : DISABLED;
  }),

  tabCleanId: computedTabId('clean'),

  getDefaultActiveTabId() {
    const activeTabShort = _.find(['sync', 'popular', 'clean'], tab =>
      this.get(camelize(`tab-${tab}-class`)) === ENABLED
    );
    return this.get(camelize(`tab-${activeTabShort}-id`));
  },

  /**
   * Set only once on init
   * @type {string}
   */
  initActiveTabId: undefined,

  init() {
    this._super(...arguments);
    this.set('initActiveTabId', this.getDefaultActiveTabId());
  },
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
