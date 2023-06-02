/**
 * List of supported spaces
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cd in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer, computed, get } from '@ember/object';
import { isArray } from '@ember/array';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { reads, not, equal } from '@ember/object/computed';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import ArrayPaginator from 'onedata-gui-common/utils/array-paginator';
import { raw, or } from 'ember-awesome-macros';
import { sort } from '@ember/object/computed';

export default Component.extend(
  I18n,
  GlobalActions, {
    classNames: ['content-clusters-spaces-list'],

    /** @override */
    i18nPrefix: 'components.contentClustersSpacesList',

    spaceManager: service(),
    globalNotify: service(),
    i18n: service(),

    /**
     * @virtual
     * @type {function}
     */
    startRevokeSpace: notImplementedThrow,

    /**
     * @virtual
     * @type {function}
     */
    updateSpacesProxy: notImplementedThrow,

    /**
     * @virtual
     */
    providerProxy: undefined,

    /**
     * @virtual
     */
    spacesProxy: undefined,

    pageSize: 25,

    supportSpaceOpened: false,

    spaces: reads('spacesProxy.content'),

    sorting: Object.freeze(['name:asc']),

    spacesSorted: sort('spaces', 'sorting'),

    spacesListLoading: reads('spacesProxy.isPending'),

    // TODO: global list loader cannot base on someSpacesSettled because it causes
    // to reload child components when changing single space (isLoading -> isSettled)
    // not removing it for now, because it is a base for creating additional
    // spinner on bottom
    someSpaceSettled: computed('spaces.@each.isSettled', function someSpaceSettled() {
      const spaces = this.get('spaces');
      return spaces ? spaces.some(s => get(s, 'isSettled')) : false;
    }),

    allSpacesSettled: computed('spaces.@each.isSettled', function allSpacesSettled() {
      const spaces = this.get('spaces');
      return spaces ? spaces.every(s => get(s, 'isSettled')) : false;
    }),

    someSpaceIsLoading: not('allSpacesSettled'),

    _hasNoSpaces: equal('spaces.length', 0),

    /**
     * @type {Ember.ComputedProperty<Action>}
     */
    _supportSpaceAction: computed('supportSpaceOpened', function () {
      const supportSpaceOpened = this.get('supportSpaceOpened');
      return {
        action: () =>
          safeExec(this, 'set', 'supportSpaceOpened', !supportSpaceOpened),
        title: this.t(supportSpaceOpened ? 'cancelSupporting' : 'supportSpace'),
        icon: supportSpaceOpened ? 'close' : 'add-filled',
        class: 'btn-support-space',
        buttonStyle: supportSpaceOpened ? 'default' : 'primary',
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

    /**
     * Using observer, because when we use computed property for spaces,
     * the whole spaces list will be generated every time name and isSettled
     * are changed.
     */
    addConflictLabels: observer(
      'spaces.@each.{content.name}',
      'allSpacesSettled',
      function () {
        const {
          spaces,
          allSpacesSettled,
        } = this.getProperties('spaces', 'allSpacesSettled');
        if (isArray(spaces) && allSpacesSettled) {
          addConflictLabels(
            spaces
            .filterBy('isFulfilled')
            .mapBy('content')
          );
        }
      }
    ),

    _hasNoSpacesObserver: observer('_hasNoSpaces', function () {
      if (this.get('_hasNoSpaces')) {
        this.set('supportSpaceOpened', true);
      }
    }),

    init() {
      this._super(...arguments);
      this.set('paginator', ArrayPaginator.extend({
        array: or('parent.spacesSorted', raw([])),
        pageSize: reads('parent.pageSize'),
      }).create({
        parent: this,
      }));
    },

    /**
     * @param {Object} supportSpaceData
     * @param {string} supportSpaceData.storageId
     * @param {string} supportSpaceData.token
     * @param {number} supportSpaceData.size
     * @returns {Promise.<any>} SpaceManager.supportSpace promise
     */
    supportSpace(supportSpaceData) {
      return this.get('spaceManager').supportSpace(supportSpaceData);
    },

    actions: {
      startRevokeSpace(space) {
        return this.get('startRevokeSpace')(space);
      },
      submitSupportSpace(supportSpaceData) {
        const globalNotify = this.get('globalNotify');
        return this.supportSpace(supportSpaceData)
          .then(() => {
            safeExec(this, 'set', 'supportSpaceOpened', false);
            scheduleOnce('afterRender', () => this.get('updateSpacesProxy')());
            globalNotify.info(
              this.t('supportSuccess')
            );
          });
      },
    },
  });
