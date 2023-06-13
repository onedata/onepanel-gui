/**
 * List of supported spaces
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cd in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { isArray } from '@ember/array';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { reads, equal } from '@ember/object/computed';
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
    classNames: ['content-clusters-spaces-list', 'content-with-pages-control'],

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
     * @type {Function}
     */
    updateSpacesData: notImplementedThrow,

    /**
     * @virtual
     */
    providerProxy: undefined,

    /**
     * @virtual
     * @type {Utils.BatchResolver}
     */
    spacesBatchResolver: undefined,

    pageSize: 25,

    supportSpaceOpened: false,

    /**
     * @type {Utils.ArrayPaginator}
     */
    paginator: undefined,

    spaces: reads('spacesBatchResolver.promiseObject.content'),

    sorting: Object.freeze(['name:asc']),

    spacesSorted: sort('spaces', 'sorting'),

    spacesListLoading: reads('spacesBatchResolver.promiseObject.isPending'),

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
    autoAddConflictLabels: observer(
      'spaces.@each.name',
      function autoAddConflictLabels() {
        if (isArray(this.spaces)) {
          addConflictLabels(this.spaces);
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
            scheduleOnce('afterRender', () => this.get('updateSpacesData')());
            globalNotify.info(
              this.t('supportSuccess')
            );
          });
      },
    },
  });
