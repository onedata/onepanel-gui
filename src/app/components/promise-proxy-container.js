import Ember from 'ember';

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
