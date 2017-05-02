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

/**
 * A singleton component that is used by ``alert`` service.
 *
 * Place it in application template.
 *
 * @module components/alert-global
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
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