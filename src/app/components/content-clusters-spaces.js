import Ember from 'ember';

const {
  Component,
  inject: { service },
} = Ember;

export default Component.extend({
  spaceManager: service(),

  _spacesProxy: null,

  init() {
    this._super(...arguments);
  },

  updateSpacesList() {
    let spaceManager = this.get('spaceManager');
    this.set('spacesProxy', spaceManager.getSpaces());
  }
});
