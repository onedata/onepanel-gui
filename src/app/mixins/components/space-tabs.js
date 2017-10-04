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
        this.get(camelize(`tab-${tab}-class`)) === ENABLED
      );
      _initActiveTabId = this.get(camelize(`tab-${activeTabShort}-id`));
      this.set('_initActiveTabId', _initActiveTabId);
      return _initActiveTabId;
    }
  }),
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
