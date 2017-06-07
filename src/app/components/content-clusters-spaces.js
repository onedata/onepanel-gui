/**
 * A content page for managing cluster's spaces
 *
 * @module components/content-clusters-spaces.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  Component,
  inject: { service },
  get,
  computed,
  observer,
  isArray,
} = Ember;

export default Component.extend({
  classNames: ['content-clusters-spaces'],

  spaceManager: service(),
  globalNotify: service(),

  spacesProxy: null,

  _supportSpaceOpened: false,
  _currentToken: '',

  // TODO maybe generic component for opening/closing forms inline 
  _supportSpaceButtonLabel: computed('_supportSpaceOpened', function () {
    // TODO i18n
    return this.get('_supportSpaceOpened') ?
      'Cancel supporting space' : 'Support space';
  }).readOnly(),

  _supportSpaceButtonType: computed('_supportSpaceOpened', function () {
    return this.get('_supportSpaceOpened') ? 'default' : 'primary';
  }),

  _isToolbarVisible: computed('spacesProxy.content', function () {
    return !this._hasNoSpaces();
  }),

  spacesObserver: observer('spacesProxy.content', function () {
    if (this._hasNoSpaces()) {
      this.set('_supportSpaceOpened', true);
    }
  }),

  init() {
    this._super(...arguments);
    this._updateSpacesList();
  },

  _hasNoSpaces() {
    let content = this.get('spacesProxy.content');
    return isArray(content) && content.length === 0;
  },

  _updateSpacesList() {
    let spaceManager = this.get('spaceManager');
    let spacesProxy = spaceManager.getSpaces();
    this.set('spacesProxy', spacesProxy);
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

  _modifySpace(id, data) {
    return this.get('spaceManager').modifySpaceDetails(id, data);
  },

  actions: {
    updateSpacesList() {
      return this._updateSpacesList();
    },
    toggleSupportSpaceForm() {
      // TODO inform user about cancelling?
      this.toggleProperty('_supportSpaceOpened');
    },
    onSupportSpaceHide() {
      return this.set('_supportSpaceOpened', false);
    },
    submitSupportSpace(supportSpaceData) {
      let globalNotify = this.get('globalNotify');
      let supportingSpace = this._supportSpace(supportSpaceData);
      supportingSpace.then(() => {
        this._updateSpacesList();
        this.set('_supportSpaceOpened', false);
        globalNotify.info(
          `Added a new support for space`
        );
      });
      return supportingSpace;
    },
    // TODO currently space can be either object or ember object
    revokeSpace(space) {
      let globalNotify = this.get('globalNotify');
      let revoking = this._revokeSpace(get(space, 'id'));
      revoking.then(() => {
        this._updateSpacesList();
        globalNotify.info(
          `Support for space "${get(space, 'name')}" has been revoked`
        );
      });
      revoking.catch(error => {
        globalNotify.backendError('space support revocation', error);
      });
      return revoking;
    },
    modifySpace(space, data) {
      let globalNotify = this.get('globalNotify');
      let modifying = this._modifySpace(get(space, 'id'), data);
      let spaceName = get(space, 'name');
      modifying.then(() => {
        this._updateSpacesList();
        globalNotify.info(
          `Configuration of "${spaceName}" space support has been changed`
        );
      });
      modifying.catch(error => {
        globalNotify.backendError(
          `configuration of "${spaceName}" space support`,
          error
        );
      });
      return modifying;
    },
  },
});
