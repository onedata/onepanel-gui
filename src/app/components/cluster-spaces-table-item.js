/**
 * Details about support provided for space
 *
 * @module components/cluster-spaces-table-item.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  Component,
  computed,
  computed: { alias },
} = Ember;

export default Component.extend({
  classNames: ['cluster-spaces-table-item'],

  /**
   * @type {Component.OneCollapsibleListItem}
   */
  oneListItem: null,

  /**
   * @type {SpaceDetails}
   */
  space: null,

  _importActive: alias('space.importEnabled'),

  _importButtonClass: computed('importConfigurationOpen', function () {
    return this.get('importConfigurationOpen') ?
      'active' :
      '';
  }),

  _importButtonActionName: computed('importConfigurationOpen', function () {
    return this.get('importConfigurationOpen') ?
      'endImportConfiguration' :
      'startImportConfiguration';
  }),

  // TODO i18n
  _importButtonTip: computed('importConfigurationOpen', '_importActive', function () {
    return this.get('importConfigurationOpen') ?
      'Cancel data import configuration' : (
        this.get('_importActive') ?
        'Data import is enabled, click to configure' :
        'Configure data import from storage'
      );
  }),

  actions: {
    revokeSpace() {
      return invokeAction(this, 'revokeSpace', this.get('space'));
    },
    startImportConfiguration() {
      // FIXME uncollapse this item panel
      this.set('importConfigurationOpen', true);
    },
    endImportConfiguration() {
      this.set('importConfigurationOpen', false);
    },
    importUpdateConfigurationSubmit(configuration) {
      invokeAction(this, 'submitModifySpace', configuration);
    },
  },
});
