import Ember from 'ember';

const {
  Component,
  inject: { service },
} = Ember;

export default Component.extend({
  classNames: ['content-clusters-spaces'],

  spaceManager: service(),

  _spacesProxy: null,

  _supportSpaceOpened: false,
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

  /**
   * @param {Object} supportSpaceData
   * @param {string} supportSpaceData.storageId
   * @param {string} supportSpaceData.token
   * @param {number} supportSpaceData.size
   * @param {boolean} supportSpaceData.mountInRoot
   */
  _supportSpace(supportSpaceData) {
    return this.get('spaceManager').supportSpace(supportSpaceData);
  },

  _revokeSpace(spaceId) {
    return this.get('spaceManager').revokeSpaceSupport(spaceId);
  },

  actions: {
    updateSpacesList() {
      return this._updateSpacesList();
    },
    supportSpace() {
      return this.set('_supportSpaceOpened', true);
    },
    onSupportSpaceHide() {
      return this.set('_supportSpaceOpened', false);
    },
    submitSupportSpace(supportSpaceData) {
      // FIXME handle errors
      return this._supportSpace(supportSpaceData);
    },
    revokeSpace(spaceId) {
      // FIXME handle errors
      return this._revokeSpace(spaceId);
    },
  },
});
