import Ember from 'ember';

const {
  inject,
  computed
} = Ember;

/**
 * Based on: https://www.w3schools.com/howto/howto_js_sidenav.asp
 */
export default Ember.Component.extend({
  classNames: ['one-sidenav', 'sidenav'],
  classNameBindings: ['isOpened:in'],

  eventsBus: inject.service(),

  isOpened: false,

  init() {
    this._super(...arguments);
    let eventsBus = this.get('eventsBus');

    eventsBus.on('one-sidenav:close', (selector) => {
      if (!selector || this.element.matches(selector)) {
        this.send('close');
      }
    });

    eventsBus.on('one-sidenav:open', (selector) => {
      if (!selector || this.element.matches(selector)) {
        this.send('open');
      }
    });
  },

  actions: {
    open() {
      this.set('isOpened', true);
    },

    close() {
      this.set('isOpened', false);
      this.sendAction('closed');
    }
  }

});
