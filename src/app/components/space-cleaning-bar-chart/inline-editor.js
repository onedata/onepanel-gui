/**
 * Inline editor for space cleaning bar quota values.
 *
 * @module components/space-cleaning-bar-chart/inline-editor
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

const {
  Component,
  computed,
  observer,
  on,
  run: {
    next,
  },
} = Ember;

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
  _readableValue: computed('value', function () {
    return bytesToString(this.get('value'), { iecFormat: true, separated: true });
  }),

  positionObserver: on('didInsertElement', observer('position', function () {
    this.$().css({
      left: this.get('position') + '%',
    });
  })),

  allowEditionObserver: on('didInsertElement', observer('allowEdition', function () {
    if (this.get('_inEditionMode')) {
      this.send('cancelEdition');
    }
  })),

  actions: {
    startEdition() {
      let {
        allowEdition,
        _readableValue,
      } = this.getProperties('allowEdition', '_readableValue');
      if (allowEdition) {
        this.setProperties({
          _editorValue: _readableValue.number,
          _inEditionMode: true,
        });
        next(() => this.$('input').focus().select());
      }
    },
    cancelEdition() {
      this.set('_inEditionMode', false);
    },
    saveEdition() {
      let {
        _editorValue,
        onSave,
        _readableValue,
      } = this.getProperties('_editorValue', 'onSave', '_readableValue');

      onSave(parseFloat(_editorValue) * _readableValue.multiplicator);
      this.set('_inEditionMode', false);
    },
  },
});
