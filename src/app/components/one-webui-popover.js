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
  observer,
  run: { scheduleOnce },
} = Ember;

export default Component.extend({
  classNames: ['one-webui-popover'],

  triggerSelector: null,

  open: undefined,

  /**
   * Values: auto, top, right, bottom, left, top-right, top-left, bottom-right,
   *  bottom-left, auto-top, auto-right, auto-bottom, auto-left, horizontal,
   *  vertical
   * @type {string}
   */
  placement: 'auto',

  selector: false,
  padding: true,

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

  init() {
    this._super(...arguments);
    let open = this.get('open');
    if (open != null) {
      this.set('popoverTrigger', 'manual');
      scheduleOnce('afterRender', () => this.triggerOpen());
    }
  },

  triggerOpen: observer('open', function () {
    let open = this.get('open');
    if (open === true) {
      this._popover('show');
    } else if (open === false) {
      this._popover('hide');
    }
  }),

  didInsertElement() {
    let {
      triggerSelector,
      animation,
      popoverTrigger,
      placement,
      elementId,
      padding,
    } = this.getProperties(
      'triggerSelector',
      'animation',
      'popoverTrigger',
      'placement',
      'padding',
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
      padding,
    });

    // FIXME it doesn't work
    // window.addEventListener('resize', () => invoke(this, 'refresh'));
  },

  _popover() {
    this.get('$triggerElement').webuiPopover(...arguments);
  },

  killPopover: on('willDestroyElement', function () {
    this._popover('destroy');
  }),

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
    // FIXME it doesn't work
    refresh() {
      this._popover('show');
    },
  },

});
