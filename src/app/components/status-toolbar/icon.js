/**
 * A status icon used in status-toolbar. For example of usage see 
 * the status-toolbar component documentation.
 *
 * @module components/status-toolbar/icon
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

export default Ember.Component.extend({
  classNames: ['status-toolbar-icon'],
  classNameBindings: [
    'status',
    'enabled::hidden',
    'clickAction::not-clickable',
  ],

  /**
   * Tooltip content
   * @type {string}
   */
  hint: null,

  /**
   * If false, component is hidden
   * @type {boolean}
   */
  enabled: true,

  /**
   * Icon name from one-icons font (without 'oneicon' prefix)
   * To inject.
   * @type {string}
   */
  icon: null,

  /**
   * Subicon name from one-icons font (without 'oneicon' prefix)
   * @type {string}
   */
  subIcon: null,

  /**
   * Subicon class
   * @type {string}
   */
  subIconClass: null,

  /**
   * Status, becomes a component class
   * To inject.
   * @type {string}
   */
  status: null,

  /**
   * Click action
   * @type {Function}
   */
  clickAction: null,

  click() {
    invokeAction(this, 'clickAction');
  }
});
