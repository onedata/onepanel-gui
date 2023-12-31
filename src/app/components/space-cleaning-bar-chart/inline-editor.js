/**
 * Inline editor for space cleaning bar quota values.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { observer, computed } from '@ember/object';
import { next } from '@ember/runloop';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import dom from 'onedata-gui-common/utils/dom';

export default Component.extend({
  classNames: ['inline-editor'],
  classNameBindings: ['_inEditionMode:editor:static'],

  /**
   * Size (in bytes).
   * To inject.
   * @type {number}
   */
  value: 0,

  /**
   * Horizontal position (in percents).
   * To inject.
   * @type {number}
   */
  position: 0,

  /**
   * Action called on save (with new value).
   * @type {Function}
   */
  onSave: () => {},

  /**
   * If true, edition is allowed.
   * @type {boolean}
   */
  allowEdition: true,

  /**
   * If true, editor is on.
   * @type {boolean}
   */
  _inEditionMode: false,

  /**
   * Editor value.
   * @type {string}
   */
  _editorValue: '',

  /**
   * Formatted value.
   * @type {computed.object}
   */
  _readableValue: computed('value', function _readableValue() {
    return bytesToString(this.get('value'), { iecFormat: true, separated: true });
  }),

  positionObserver: observer('position', function positionObserver() {
    if (this.element) {
      dom.setStyle(this.element, 'left', `${this.position}%`);
    }
  }),

  allowEditionObserver: observer('allowEdition', function allowEditionObserver() {
    if (this.get('_inEditionMode')) {
      this.send('cancelEdition');
    }
  }),

  didInsertElement() {
    this._super(...arguments);
    this.positionObserver();
    this.allowEditionObserver();
  },

  actions: {
    startEdition() {
      if (this.allowEdition) {
        this.setProperties({
          _editorValue: this._readableValue.number,
          _inEditionMode: true,
        });
        next(() => {
          const input = this.element?.querySelector('input');
          if (input) {
            input.focus();
            input.select();
          }
        });
      }
    },
    cancelEdition() {
      this.set('_inEditionMode', false);
    },
    saveEdition() {
      const {
        _editorValue,
        onSave,
        _readableValue,
      } = this.getProperties('_editorValue', 'onSave', '_readableValue');

      onSave(Math.floor(parseFloat(_editorValue) * _readableValue.multiplicator));
      this.set('_inEditionMode', false);
    },
  },
});
