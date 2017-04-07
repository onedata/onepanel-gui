import Ember from 'ember';

const {
  Component,
  assert,
  on,
} = Ember;

export default Component.extend({
  classNames: ['one-webui-popover'],

  triggerSelector: null,

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
    } = this.getProperties('triggerSelector', 'animation', 'popoverTrigger');

    let $triggerElement = $(triggerSelector);

    this.set('$triggerElement', $triggerElement);

    assert(
      'triggerElement should match at least one element',
      $triggerElement.length >= 1
    );

    $triggerElement.webuiPopover({
      url: '#' + this.get('elementId'),
      animation,
      trigger: popoverTrigger,
    });
  },

  killPopover: on("willDestroyElement", function () {
    this.get('$triggerElement').webuiPopover("destroy");
  }),

  actions: {
    close() {
      this.get('$triggerElement').webuiPopover('hide');
    },
  },

});
