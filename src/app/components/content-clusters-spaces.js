/**
 * A content page for managing cluster's spaces
 *
 * @module components/content-clusters-spaces.js
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { not, reads } from '@ember/object/computed';
import { observer, computed, get } from '@ember/object';
import { isArray } from '@ember/array';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, GlobalActions, {
  classNames: ['content-clusters-spaces'],

  spaceManager: service(),
  providerManager: service(),
  globalNotify: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersSpaces',

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

  _hasNoSpaces: computed('spaces.length', function () {
    let spaces = this.get('spaces');
    return isArray(spaces) && get(spaces, 'length') === 0;
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  _supportSpaceAction: computed('_supportSpaceOpened', function () {
    const _supportSpaceOpened = this.get('_supportSpaceOpened');
    return {
      action: () => this.send('toggleSupportSpaceForm'),
      title: this.t(_supportSpaceOpened ? 'cancelSupporting' : 'supportSpace'),
      class: 'btn-support-space',
      buttonStyle: _supportSpaceOpened ? 'default' : 'primary',
    };
  }),

  /**
   * @override
   */
  globalActions: computed('_hasNoSpaces', '_supportSpaceAction', function () {
    const {
      _hasNoSpaces,
      _supportSpaceAction,
    } = this.getProperties('_hasNoSpaces', '_supportSpaceAction');
    return _hasNoSpaces ? [] : [_supportSpaceAction];
  }),

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
      const globalNotify = this.get('globalNotify');
      let supportingSpace = this._supportSpace(supportSpaceData);
      supportingSpace.then(() => {
        this._updateSpacesList();
        this.set('_supportSpaceOpened', false);
        globalNotify.info(
          this.t('supportSuccess')
        );
      });
      return supportingSpace;
    },
    // TODO currently space can be either object or ember object
    revokeSpace(space) {
      const globalNotify = this.get('globalNotify');
      let revoking = this._revokeSpace(get(space, 'id'));
      const spaceName = get(space, 'name');
      revoking.then(() => {
        this._updateSpacesList();
        globalNotify.info(this.t('revokeSuccess', { spaceName }));
      });
      revoking.catch(error => {
        globalNotify.backendError(this.t('revocationAction'), error);
      });
      return revoking;
    },
    modifySpace(space, data) {
      const globalNotify = this.get('globalNotify');
      let spaceName = get(space, 'name');
      let spaceId = get(space, 'id');
      return this._modifySpace(spaceId, data)
        .then(() => {
          globalNotify.info(this.t('configurationChanged', { spaceName }));
        })
        .catch(error => {
          // TODO: handle error on higher levels to produce better message
          globalNotify.backendError(
            this.t('configurationAction', { spaceName }),
            error
          );
          throw error;
        });
    },
  },
});
