/**
 * Details about support provided for space
 *
 * @module components/cluster-spaces-table-item.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import _includes from 'lodash/includes';
import SpaceItemSyncStats from 'onepanel-gui/mixins/components/space-item-sync-stats';
import SpaceItemSupports from 'onepanel-gui/mixins/components/space-item-supports';
import SpaceFilesPopularity from 'onepanel-gui/mixins/components/space-files-popularity';
import SpaceAutoCleaning from 'onepanel-gui/mixins/components/space-auto-cleaning';
import SpaceTabs from 'onepanel-gui/mixins/components/space-tabs';

const {
  Component,
  computed,
  computed: { readOnly },
  get,
  inject: { service },
} = Ember;

/**
 * Space's `storageImport` properties that shouldn't be listed as generic
 * properties (can be handled separately)
 * @type {Array.string}
 */
const SKIPPED_IMPORT_PROPERTIES = ['strategy'];

/**
 * Space's `storageUpdate` properties that shouldn't be listed as generic
 * properties (can be handled separately)
 * @type {Array.string}
 */
const SKIPPED_UPDATE_PROPERTIES = ['strategy'];

const I18N_PREFIX = 'components.clusterSpacesTableItem.';

export default Component.extend(
  SpaceItemSyncStats,
  SpaceItemSupports,
  SpaceFilesPopularity,
  SpaceAutoCleaning,
  SpaceTabs, {
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
     * @type {Ember.ObjectProxy<SpaceDetails>}
     */
    spaceProxy: null,

    // TODO: support for errors after update
    /**
     * @type {SpaceDetails}
     */
    space: computed('spaceProxy.isFulfilled', function () {
      const spaceProxy = this.get('spaceProxy');
      if (get(spaceProxy, 'isFulfilled') === true) {
        return this.set('_spaceCache', get(spaceProxy, 'content'));
      } else {
        return this.get('_spaceCache');
      }
    }),

    /**
     * Last resolved SpaceDetails
     * @type {SpaceDetails}
     */
    _spaceCache: null,

    /**
     * Storage that supports space on this panel's provider
     * @type {PromiseObject}
     */
    _storage: computed('space.storageId', function () {
      let space = this.get('space');
      if (space) {
        let storageManager = this.get('storageManager');
        return storageManager.getStorageDetails(get(space, 'storageId'));
      }
    }),

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

    /**
     * Which tab should be shown for space details
     * @type {Ember.ComputedProperty<string>}
     */
    _detailsToShow: '',

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

    actions: {
      startRevoke() {
        this.set('_openRevokeModal', true);
      },
      hideRevoke() {
        this.set('_openRevokeModal', false);
      },
      revokeSpace() {
        const {
          revokeSpace,
          space,
        } = this.getProperties('revokeSpace', 'space');
        return revokeSpace(space);
      },
      startImportConfiguration(toggleAction) {
        this.set('importConfigurationOpen', true);
        toggleAction.call(null, true);
      },
      endImportConfiguration() {
        this.set('importConfigurationOpen', false);
      },
      submitModifySpace() {
        return this.get('submitModifySpace')(...arguments);
      },
      updateFilesPopularity(filesPopularity) {
        return this.get('submitModifySpace')({ filesPopularity });
      },
      updateAutoCleaning(autoCleaning) {
        return this.get('submitModifySpace')({ autoCleaning });
      },
    },
  });
