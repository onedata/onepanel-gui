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

const {
  Component,
  computed,
  computed: { alias },
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

export default Component.extend({
  classNames: ['cluster-spaces-table-item'],

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

  _importActive: alias('space.importEnabled'),

  _importButtonClass: computed('importConfigurationOpen', function () {
    return this.get('importConfigurationOpen') ?
      'active' :
      '';
  }),

  _importButtonActionName: computed('importConfigurationOpen', function () {
    return this.get('importConfigurationOpen') ?
      'endImportConfiguration' :
      'startImportConfiguration';
  }),

  // TODO i18n
  _importButtonTip: computed('importConfigurationOpen', '_importActive', function () {
    return this.get('importConfigurationOpen') ?
      'Cancel data import configuration' : (
        this.get('_importActive') ?
        'Data import is enabled, click to configure' :
        'Configure data import from storage'
      );
  }),

  importTranslationPrefix: 'components.clusterSpacesTableItem.storageImport.',
  updateTranslationPrefix: 'components.clusterSpacesTableItem.storageUpdate.',

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
