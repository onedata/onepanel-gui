import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  Component,
} = Ember;

export default Component.extend({
  tagName: '',

  /**
   * @type {ObjectPromiseProxy}
   */
  proxy: null,

  actions: {
    toggleShowDetails() {
      this.toggleProperty('showDetails');
    },
  }
});
