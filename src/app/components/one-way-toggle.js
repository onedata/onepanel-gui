import Ember from 'ember';
import RecognizerMixin from 'ember-gestures/mixins/recognizers';
import { invokeAction, invoke } from 'ember-invoke-action';

const { 
  Component,
  run: {
    next,
  },
} = Ember;

/**
 * Creates toggle-like checkbox based one the one-toggle-checkbox component.
 *
 * @module components/one-way-toggle.js
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend(RecognizerMixin, {
  classNames: ['one-way-toggle'],
  classNameBindings: ['isReadOnly:disabled', 'isReadOnly::clickable'],
  attributeBindings: ['dataOption:data-option'],

  recognizers: 'pan',

  /**
   * Element ID for rendered invisible input element
   * @type {string}
   */
  inputId: null,

  /**
   * If true, toggle is in enabled state
   * @type {boolean}
   */
  checked: false,

  /**
   * If true, user couldn't change value of toggle
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * Optional - data-option attribute for rendered component
   * @type {string}
   */
  dataOption: null,

  /**
   * If true, click action handler will be disabled
   * (used by pan event handlers)
   * @type {boolean}
   */
  _disableClick: false,

  didInsertElement() {
    this._super(...arguments);

    // Fix for Firefox to handle toggle change by 
    // label-click and keyboard change on active input
    this.$('input').change((event) => {
      let originalTarget = event.originalEvent.explicitOriginalTarget;
      // originalTarget == undefined in Chrome, nodeType == 3 is text node (label)
      if (originalTarget &&
        (originalTarget.tagName === "INPUT" || originalTarget.nodeType === 3)) {
        invoke(this, 'toggle');
      }
    });
  },

  click() {
    if (!this.get('_disableClick')) {
      invoke(this, 'toggle');
    }
  },

  panStart() {
    this.set('_disableClick', true);
  },

  panMove(event) {
    let toggleElement = this.$('.one-way-toggle-control');
    let mouseX = event.originalEvent.gesture.center.x;
    let moveRatio = (mouseX - toggleElement.offset().left) /
      toggleElement.outerWidth();

    if (this.get('checked') !== moveRatio > 0.5) {
      invoke(this, 'toggle');
    }
  },

  panEnd() {
    next(() =>this.set('_disableClick', false));
  },

  actions: {
    /**
     * Pass click handling to underlying one-way-checkbox
     */
    toggle() {
      if (!this.get('isReadOnly')) {
        this.$('input').click();
      }
    },
    updateHandler(value) {
      invokeAction(this, 'update', value, this);
    }
  }
});
