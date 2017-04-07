import Ember from 'ember';
import { invoke, invokeAction } from 'ember-invoke-action';

const {
  Component,
  assert,
  on,
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
