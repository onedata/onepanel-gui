/**
 * Storage property shown in storages table
 *
 * Please put it in ``cluster-storage-table``.
 *
 * @module components/storage-item
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';
import config from 'ember-get-config';
import STORAGE_TYPES from 'onepanel-gui/utils/cluster-storage/storage-types';

const {
  layoutConfig,
} = config;

export default Component.extend(I18n, {
  classNames: ['storage-item'],

  storageManager: service(),
  storageActionsService: service('storageActions'),
  globalNotify: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.storageItem',

  /**
   * @virtual
   * @type {OneCollapsibleListItem}
   */
  listItem: null,

  /**
   * @virtual
   * @type {ObjectProxy<Onepanel.StorageDetails>}
   */
  storageProxy: null,

  /**
   * Modify storage action callback
   * @type {Function}
   */
  submitModifyStorage: null,

  /**
   * @type {Onepanel.StorageDetails|null}
   */
  storage: reads('storageProxy.content'),

  /**
   * If true, storage edit form is visible
   */
  whileEdition: false,

  /**
   * @type {Array<ObjectProxy<OnepanelGui.SpaceDetails>>}
   */
  spaces: computed(function spaces() {
    return [];
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  storageId: reads('storage.id'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasSupportedSpaces: computed(
    'spaces.@each.isFulfilled',
    'storageId',
    function hasSupportedSpaces() {
      const {
        spaces,
        storageId,
      } = this.getProperties('spaces', 'storageId');
      return !!spaces.findBy('storageId', storageId);
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  showSpacesSupport: reads('hasSupportedSpaces'),

  /**
   * Readable name of storage typee
   * Eg. Ceph, Ceph RADOS, POSIX, S3, Swift, GlusterFS, Null Device, WebDAV
   * @type {string}
   */
  storageType: computed('storage.type', function () {
    let st = this.get('storage.type');
    return st && _.find(STORAGE_TYPES, s => s.id === st).name;
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  modifyStorageAction: computed('whileEdition', function modifyStorageAction() {
    const whileEdition = this.get('whileEdition');
    return {
      action: () => this.toggleEdition(),
      title: this.t(
        whileEdition ? 'cancelStorageModification' : 'modifyStorageDetails'
      ),
      class: 'modify-storage-details',
      icon: 'rename',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeStorageAction: computed('hasSupportedSpaces', function () {
    const hasSupportedSpaces = this.get('hasSupportedSpaces');
    return {
      action: () => this.get('removeStorage')(),
      title: this.t('removeStorage'),
      class: 'remove-storage',
      icon: 'close',
      disabled: hasSupportedSpaces,
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  storageActions: collect('modifyStorageAction', 'removeStorageAction'),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  formLayoutConfig: computed('whileEdition', function formLayoutConfig() {
    const whileEdition = this.get('whileEdition');
    const config = _.assign({}, layoutConfig);
    if (whileEdition) {
      _.assign(config, {
        formLabelColumns: 'col-xs-12 col-sm-3 text-left',
        formInputColumns: 'col-xs-12 col-sm-9',
        formToggleLabelColumns: 'col-xs-9 col-sm-3 text-left',
        formToggleInputColumns: 'col-xs-3 col-sm-9 text-xs-right',
        formSubmitColumns: 'col-xs-12 col-sm-9 col-sm-offset-3 text-xs-center',
      });
    }
    return config;
  }),

  /**
   * Starts/stops storage edition. Expands list item if necessary
   * @returns {undefined} 
   */
  toggleEdition() {
    this.toggleProperty('whileEdition');
    if (this.get('whileEdition')) {
      this.get('listItem.toggle')(true);
    }
  },

  actions: {
    saveEdition(storageFormData) {
      // nothing to modify - close form
      // <= 1 because "type" field is always sent by form
      if (get(Object.keys(storageFormData), 'length') <= 1) {
        this.set('whileEdition', false);
        return resolve();
      }

      const {
        submitModifyStorage,
        storage,
      } = this.getProperties(
        'submitModifyStorage',
        'storage'
      );

      return submitModifyStorage(storage, storageFormData)
        .then(() =>
          safeExec(this, 'set', 'whileEdition', false)
        );
    },
    cancelEdition() {
      this.set('whileEdition', false);
    },
  },
});
