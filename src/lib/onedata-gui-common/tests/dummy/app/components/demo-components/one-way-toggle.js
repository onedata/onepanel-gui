/**
 * @module components/demo-components/one-way-toggle
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { Promise } from 'rsvp';
import { run } from '@ember/runloop';

export default Ember.Component.extend({
  // values for toggles
  twoStateToggle: false,
  threeStateToggle: 2,
  disabledToggle: true,
  delayedToggle: false,

  actions: {
    toggle1FocusOut() {
      console.log('toggle1 focus out');
    },
    promisedToggle() {
      return new Promise(resolve => {
        run.later(() => {
          this.toggleProperty('delayedToggle');
          resolve();
        }, 3000);
      });
    }
  }
});
