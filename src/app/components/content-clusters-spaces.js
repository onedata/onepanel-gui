/**
 * A content page for managing cluster's spaces
 *
 * @module components/content-clusters-spaces.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import ConflictIdsArray from 'onedata-gui-common/utils/conflict-ids-array';

const {
  Component,
  inject: { service },
  get,
  computed,
  computed: {
    not,
  },
  observer,
  isArray,
} = Ember;

export default Component.extend({
  classNames: ['content-clusters-spaces'],

  spaceManager: service(),
  globalNotify: service(),

  spacesProxy: null,

  spaces: computed('spacesProxy.content.@each.isSettled', function () {
    let content = this.get('spacesProxy.content');
    if (isArray(content) && content.every(space => get(space, 'isSettled'))) {
      return ConflictIdsArray.create({ content });
    }
  }),

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

  _hasNoSpaces: computed('spaces.[]', function () {
    let spaces = this.get('spaces');
    return isArray(spaces) && get(spaces, 'length') === 0;
  }),

  _isToolbarVisible: not('_hasNoSpaces'),

  _hasNoSpacesObserver: observer('_hasNoSpaces', function () {
    if (this.get('_hasNoSpaces')) {
      this.set('_supportSpaceOpened', true);
    }
  }),

  init() {
    this._super(...arguments);
    this._updateSpacesList();
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
   * @returns {Promise.<any>} SpaceManager.supportSpace promise
   */
  _supportSpace(supportSpaceData) {
    return this.get('spaceManager').supportSpace(supportSpaceData);
  },

  _revokeSpace(spaceId) {
    return this.get('spaceManager').revokeSpaceSupport(spaceId);
  },

  _modifySpace(id, data, reload = false) {
    return this.get('spaceManager').modifySpaceDetails(id, data, reload);
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
          'Added a new support for space'
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
    modifySpace(space, data, reload = false) {
      let globalNotify = this.get('globalNotify');
      let modifying = this._modifySpace(get(space, 'id'), data, reload);
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
