/**
 * An Ember component wrapper for webui-popover: https://github.com/sandywalker/webui-popover
 *
 * Requires installation and usage of webui-popover Bower package.
 *
 * There is an alternative implementation in: https://github.com/parablesoft/ember-webui-popover
 * but it renders ``<a>`` element with each component instance and assumes
 * that the pover conent will be bound to this anchor, so binding a custom
 * trigger element will be somewhat hacky.
 *
 * In contrast, this wrapper allows to bind popover open to any element with
 * ``triggerSelector`` property.
 *
 * @module components/one-webui-popover
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invoke, invokeAction } from 'ember-invoke-action';

const {
  Component,
  assert,
  on,
  run
} = Ember;

export default Component.extend({
  classNames: ['one-webui-popover', 'webui-popover-content'],

  triggerSelector: null,

  /**
   * Values: auto, top, right, bottom, left, top-right, top-left, bottom-right,
   *  bottom-left, auto-top, auto-right, auto-bottom, auto-left, horizontal,
   *  vertical
   * @type {string}
   */
  placement: 'auto',

  /**
   * One of: pop, fade
   * @type {string|null}
   */
  animation: 'fade',

  /**
   * One of: click, hover, manual (handle events by your self), sticky (always show after popover is created)
   * @type {string}
   */
  popoverTrigger: 'click',

  _isPopoverVisible: false,
  _debounceTimerActive: false,

  didInsertElement() {
    let {
      triggerSelector,
      animation,
      popoverTrigger,
      placement,
      elementId,
    } = this.getProperties(
      'triggerSelector',
      'animation',
      'popoverTrigger',
      'placement',
      'elementId'
    );

    let $triggerElement = $(triggerSelector);

    assert(
      'triggerElement should match at least one element',
      $triggerElement.length >= 1
    );

    this.set('$triggerElement', $triggerElement);

    $triggerElement.webuiPopover({
      url: `#${elementId}`,
      animation,
      trigger: popoverTrigger,
      placement,
      container: this.parentView.$(),
      onShow: () => this.set('_isPopoverVisible', true),
      onHide: () => this.set('_isPopoverVisible', false)
    });

    window.addEventListener('resize', () => this.send('refresh'));
  },

  _popover() {
    this.get('$triggerElement').webuiPopover(...arguments);
  },

  killPopover: on('willDestroyElement', function () {
    this._popover('destroy');
  }),

  _debounceResizeRefresh() {
    this._popover('show');
    this.set('_debounceTimerActive', false);
  },

  actions: {
    hide() {
      this._popover('hide');
    },
    submit() {
      this._popover({ dismissible: false });
      let submitPromise = invokeAction(this, 'submit');
      submitPromise.finally(() => {
        invoke(this, 'hide');
      });
      return submitPromise;
    },
    refresh() {
      let {
        _isPopoverVisible,
        _debounceTimerActive
      } = this.getProperties('_isPopoverVisible', '_debounceTimerActive');
      if (_isPopoverVisible) {
        this._popover('hide');
        this.set('_debounceTimerActive', true);
      }
      if (_isPopoverVisible || _debounceTimerActive) {
        run.debounce(this, this._debounceResizeRefresh, 500);
       }
    },
  },

});
