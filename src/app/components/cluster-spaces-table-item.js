/**
 * Details about support provided for space
 *
 * @module components/cluster-spaces-table-item.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';
import _includes from 'lodash/includes';
import SpaceItemSyncStats from 'onepanel-gui/mixins/components/space-item-sync-stats';
import SpaceItemSupports from 'onepanel-gui/mixins/components/space-item-supports';

const {
  Component,
  computed,
  computed: { readOnly },
  get,
  inject: { service },
} = Ember;

/**
 * Space's ``storageImport`` properties that shouldn't be listed as generic
 * properties (can be handled separately)
 * @type {Array.string}
 */
const SKIPPED_IMPORT_PROPERTIES = ['strategy'];

/**
 * Space's ``storageUpdate`` properties that shouldn't be listed as generic
 * properties (can be handled separately)
 * @type {Array.string}
 */
const SKIPPED_UPDATE_PROPERTIES = ['strategy'];

const I18N_PREFIX = 'components.clusterSpacesTableItem.';

export default Component.extend(SpaceItemSyncStats, SpaceItemSupports, {
  classNames: ['cluster-spaces-table-item'],

  i18n: service(),

  storageManager: service(),

  /**
   * OneCollapsibleListItem that should be used to render this
   * To inject.
   * @type {Component.OneCollapsibleListItem}
   */
  listItem: null,

  /**
   * @type {SpaceDetails}
   */
  space: null,

  /**
   * Storage that supports space on this panel's provider
   * @type {ObjectPromiseProxy}
   */
  _storage: null,

  /**
   * If true, space revoke modal is opened
   * @type {boolean}
   */
  _openRevokeModal: false,

  /**
   * If true, this space has synchronization import enabled
   *
   * That means, the view should be enriched with sync statuses and statistics
   * @type {computed.boolean}
   */
  _importActive: readOnly('space.importEnabled'),

  /**
   * If true, the space item is expanded
   * @type {computed.boolean}
   */
  _isActive: readOnly('listItem.isActive'),

  _importButtonActionName: computed('importConfigurationOpen', function () {
    return this.get('importConfigurationOpen') ?
      'endImportConfiguration' :
      'startImportConfiguration';
  }),

  // TODO i18n
  _importButtonTip: computed('importConfigurationOpen', function () {
    let i18n = this.get('i18n');
    return this.get('importConfigurationOpen') ?
      i18n.t(I18N_PREFIX + 'cancelSyncConfig') :
      i18n.t(I18N_PREFIX + 'syncConfig');
  }),

  importTranslationPrefix: I18N_PREFIX + 'storageImport.',
  updateTranslationPrefix: I18N_PREFIX + 'storageUpdate.',

  importStrategyLabel: computed('space.storageImport.strategy', function () {
    let i18n = this.get('i18n');
    let importTranslationPrefix = this.get('importTranslationPrefix');
    let strategy = this.get('space.storageImport.strategy');
    return i18n.t(`${importTranslationPrefix}strategies.${strategy}`);
  }),

  updateStrategyLabel: computed('space.storageUpdate.strategy', function () {
    let i18n = this.get('i18n');
    let updateTranslationPrefix = this.get('updateTranslationPrefix');
    let strategy = this.get('space.storageUpdate.strategy');
    return i18n.t(`${updateTranslationPrefix}strategies.${strategy}`);
  }),

  /**
   * List of specific non-empty, type-specific storage import properties
   * @type {Array}
   */
  importProperties: computed('space.storageImport', 'space.content', function () {
    let space = this.get('space');
    // support for ObjectProxy
    if (space != null && space.content != null) {
      space = space.get('content');
    }
    let storageImport = get(space, 'storageImport');
    return storageImport != null ?
      Object.keys(storageImport).filter(p =>
        get(storageImport, p) != null && !_includes(SKIPPED_IMPORT_PROPERTIES, p)
      ) : [];
  }),

  /**
   * List of specific non-empty, type-specific storage update properties
   * @type {Array}
   */
  updateProperties: computed('space.storageUpdate', 'space.content', function () {
    let space = this.get('space');
    // support for ObjectProxy
    if (space != null && space.content != null) {
      space = space.get('content');
    }
    let storageUpdate = get(space, 'storageUpdate');
    return storageUpdate != null ?
      Object.keys(storageUpdate).filter(p =>
        get(storageUpdate, p) != null && !_includes(SKIPPED_UPDATE_PROPERTIES, p)
      ) : [];
  }),

  importFormDefaultValue: computed('space', function () {
    let space = this.get('space');
    // support for ObjectProxy
    if (space != null && space.content != null) {
      space = space.content;
    }
    return space;
  }),

  init() {
    this._super(...arguments);
    let space = this.get('space');
    if (space) {
      let storageManager = this.get('storageManager');
      this.set('_storage', storageManager.getStorageDetails(space.get('storageId')));
    }
  },

  actions: {
    startRevoke() {
      this.set('_openRevokeModal', true);
    },
    hideRevoke() {
      this.set('_openRevokeModal', false);
    },
    revokeSpace() {
      return invokeAction(this, 'revokeSpace', this.get('space'));
    },
    startImportConfiguration(toggleAction) {
      this.set('importConfigurationOpen', true);
      toggleAction.call(null, true);
    },
    endImportConfiguration() {
      this.set('importConfigurationOpen', false);
    },
    importUpdateConfigurationSubmit(configuration) {
      return invokeAction(this, 'submitModifySpace', configuration);
    },
  },
});
