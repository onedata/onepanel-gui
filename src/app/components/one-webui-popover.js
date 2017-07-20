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
  computed,
  run: { scheduleOnce },
  run,
  inject: { service },
} = Ember;

export default Component.extend({
  classNames: ['one-webui-popover', 'webui-popover-content'],

  eventsBus: service(),

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
   * Tells if multiple popovers are allowed.
   * @type {boolean}
   */
  multi: false,

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

  _resizeHandler: computed(function() {
    return () => this.send('refresh');
  }),

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

  _isPopoverVisible: false,
  _debounceTimerEnabled: false,

  didInsertElement() {
    let {
      triggerSelector,
      animation,
      popoverTrigger,
      placement,
      popoverStyle,
      elementId,
      padding,
      multi,
      _resizeHandler
    } = this.getProperties(
      'triggerSelector',
      'animation',
      'popoverTrigger',
      'placement',
      'popoverStyle',
      'padding',
      'elementId',
      'eventsBus',
      'multi',
      '_resizeHandler'
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
      style: popoverStyle,
      padding,
      container: document.body,
      multi,
      onShow: () => this.set('_isPopoverVisible', true),
      onHide: () => this.set('_isPopoverVisible', false),
    });

    window.addEventListener('resize', _resizeHandler);
    this._registerEventsBus();
  },

  willDestroyElement() {
    this._super(...arguments);

    let _resizeHandler = this.get('_resizeHandler');

    this._deregisterEventsBus();
    window.removeEventListener('resize', _resizeHandler);
  },

  _onUpdateEvent: computed(function () {
    return (selector) => {
      if (!selector || this.$().is(selector)) {
        invoke(this, 'refresh');
      }
    };
  }),

  _registerEventsBus() {
    this.get('eventsBus').on(
      'one-webui-popover:update',
      this.get('_onUpdateEvent')
    );
  },

  _deregisterEventsBus() {
    this.get('eventsBus').off(
      'one-webui-popover:update',
      this.get('_onUpdateEvent')
    );
  },

  _popover() {
    this.get('$triggerElement').webuiPopover(...arguments);
  },

  killPopover: on('willDestroyElement', function () {
    this._popover('destroy');
  }),

  _debounceResizeRefresh() {
    let {
      $triggerElement,
      open
    } = this.getProperties('$triggerElement', 'open');
    if (this.isDestroyed || this.isDestroying) {
      return;
    }
    if ($triggerElement.is(':visible') && open !== false) {
      this._popover('show');
    }
    this.set('_debounceTimerEnabled', false);
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
        _debounceTimerEnabled
      } = this.getProperties('_isPopoverVisible', '_debounceTimerEnabled');
      if (_isPopoverVisible) {
        this._popover('hide');
        this.set('_debounceTimerEnabled', true);
      }
      if (_isPopoverVisible || _debounceTimerEnabled) {
        run.debounce(this, this._debounceResizeRefresh, 500);
      }
    },
  },

});
