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

  actions: {
    revokeSpace() {
      return invokeAction(this, 'revokeSpace', this.get('space'));
    },
  },
});
