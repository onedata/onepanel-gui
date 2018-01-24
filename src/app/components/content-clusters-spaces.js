/**
 * A content page for managing cluster's spaces
 *
 * @module components/content-clusters-spaces.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { not, reads } from '@ember/object/computed';
import { observer, computed, get } from '@ember/object';
import { isArray } from '@ember/array';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';

export default Component.extend({
  classNames: ['content-clusters-spaces'],

  spaceManager: service(),
  providerManager: service(),
  globalNotify: service(),

  /**
   * Set by `_updateSpacesList`
   * @type {PromiseObject<Array>}
   */
  spacesProxy: null,

  /**
   * @type {PromiseObject<ProviderDetails>}
   */
  providerProxy: null,

  spaces: reads('spacesProxy.content'),

  spacesListLoading: reads('spacesProxy.isPending'),

  // TODO: global list loader cannot base on someSpacesSettled because it causes
  // to reload child components when changing single space (isLoading -> isSettled)
  // not removing it for now, because it is a base for creating additional
  // spinner on bottom
  someSpaceSettled: computed('spaces.@each.isSettled', function () {
    const spaces = this.get('spaces');
    if (spaces) {
      return spaces.some(s => get(s, 'isSettled'));
    } else {
      return false;
    }
  }),

  allSpacesSettled: computed('spaces.@each.isSettled', function () {
    const spaces = this.get('spaces');
    if (spaces) {
      return spaces.every(s => get(s, 'isSettled'));
    } else {
      return false;
    }
  }),

  someSpaceIsLoading: not('allSpacesSettled'),

  /**
   * Using observer, because when we use computed property for spaces,
   * the whole spaces list will be generated every time name and isSettled
   * are changed.
   */
  addConflictLabels: observer('spaces.@each.{content.name,isSettled}', function () {
    const spaces = this.get('spaces');
    if (isArray(spaces) && spaces.every(s => get(s, 'isSettled'))) {
      addConflictLabels(
        spaces
        .filter(s => get(s, 'isFulfilled'))
        .map(s => get(s, 'content'))
      );
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

  _hasNoSpaces: computed('spaces.length', function () {
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
    this.set('providerProxy', this.get('providerManager').getProviderDetails());
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
      const {
        globalNotify,
        i18n,
      } = this.getProperties('globalNotify', 'i18n');
      let supportingSpace = this._supportSpace(supportSpaceData);
      supportingSpace.then(() => {
        this._updateSpacesList();
        this.set('_supportSpaceOpened', false);
        globalNotify.info(
          i18n.t('components.contentClustersSpaces.supportSuccess')
        );
      });
      return supportingSpace;
    },
    // TODO currently space can be either object or ember object
    revokeSpace(space) {
      const {
        globalNotify,
        i18n,
      } = this.getProperties('globalNotify', 'i18n');
      let revoking = this._revokeSpace(get(space, 'id'));
      const spaceName = get(space, 'name');
      revoking.then(() => {
        this._updateSpacesList();
        globalNotify.info(
          i18n.t('components.contentClustersSpaces.revokeSuccess', {
            spaceName,
          })
        );
      });
      revoking.catch(error => {
        globalNotify.backendError(
          i18n.t('components.contentClustersSpaces.revocationAction'),
          error
        );
      });
      return revoking;
    },
    modifySpace(space, data) {
      const {
        globalNotify,
        i18n,
      } = this.getProperties('globalNotify', 'i18n');
      let spaceName = get(space, 'name');
      let spaceId = get(space, 'id');
      return this._modifySpace(spaceId, data)
        .then(() => {
          globalNotify.info(
            i18n.t('components.contentClustersSpaces.configurationChanged', {
              spaceName,
            })
          );
        })
        .catch(error => {
          // TODO: handle error on higher levels to produce better message
          globalNotify.backendError(
            i18n.t('components.contentClustersSpaces.configurationAction', {
              spaceName,
            }),
            error
          );
          throw error;
        });
    },
  },
});
