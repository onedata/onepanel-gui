import Ember from 'ember';

/**
 * Inserts 'help' icon with tooltip
 * Typical usage: 
 * ```
 * {{one-label-tip title="tooltip text"}}
 * ```
 * 
 * @module components/one-label-tip
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  tagName: 'span',
  classNames: ['one-label-tip'],

  /**
   * Text used in tooltip
   * @type {string}
   */
  title: '',

  /**
   * Icon used as a tooltip trigger (from oneicons icons set)
   * @type {string}
   */
  icon: 'sign-question',

  /**
   * Placement of the tooltip 
   * @type {string}
   */
  placement: 'bottom',

  /**
   * The event(s) that should trigger the tooltip
   * @type {string}
   */
  triggerEvents: 'hover',
});
