import Ember from 'ember';

const {
  Component,
  inject: { service },
} = Ember;

export default Component.extend({
  classNames: ['content-clusters-spaces'],

  spaceManager: service(),

  _spacesProxy: null,

  _currentToken: '',

  init() {
    this._super(...arguments);
    this._updateSpacesList();
  },

  _updateSpacesList() {
    let spaceManager = this.get('spaceManager');
    let spacesProxy = spaceManager.getSpaces();
    this.set('_spacesProxy', spacesProxy);
    return spacesProxy.get('promise');
  },

  _supportSpace() {
    let spaceManager = this.get('spaceManager');
    let token = this.get('_currentToken');
    return spaceManager.supportSpace({
      size: 1000000000,
      storageId: 'Storydz',
      token: token,
      mountInRoot: true,
    });
  },

  actions: {
    updateSpacesList() {
      return this._updateSpacesList();
    },
    createSpace() {
      return this._supportSpace();
    },
  },
});
