import Ember from 'ember';

const {
  inject: {
    service
  },
  computed: {
    readOnly
  },
  Component,
} = Ember;

export default Component.extend({
  alert: service(),

  open: readOnly('alert.opened'),
  text: readOnly('alert.text'),

  actions: {
    onHide() {
      this.set('alert.opened', false);
    },
  }
});
