/**
 * A content page for single cluster 
 *
 * @module component/content-clusters
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  Component,
  RSVP: { Promise },
  run: { scheduleOnce },
} = Ember;

export default Component.extend({
  initProcess: false,

  cluster: null,

  init() {
    this._super(...arguments);
    if (!this.get('cluster.isInitialized')) {
      this.set('initProcess', true);
    } else {
      scheduleOnce('afterRender', () => invokeAction(this, 'goToDefaultAspect'));
    }
  },

  actions: {
    finishInitProcess() {
      return new Promise(resolve => {
        this.set('initProcess', false);
        scheduleOnce('afterRender', () => invokeAction(this, 'goToDefaultAspect'));
        resolve();
      });
    },
  },
});
