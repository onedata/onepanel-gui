/**
 * Details about support provided for space
 *
 * @module components/cluster-spaces-table-item.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import _ from 'lodash';
import { readOnly, reads } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import SpaceItemSyncStats from 'onepanel-gui/mixins/components/space-item-sync-stats';
import SpaceItemSupports from 'onepanel-gui/mixins/components/space-item-supports';
import SpaceTabs from 'onepanel-gui/mixins/components/space-tabs';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

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
  SpaceTabs,
  I18n, {
    classNames: ['cluster-spaces-table-item'],

    i18n: service(),

    storageManager: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.clusterSpacesTableItem',

    /**
     * @virtual
     * @type {function}
     */
    submitModifySpace: undefined,

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

    /**
     * @type {ProvidetDetails}
     */
    provider: null,

    // TODO: support for errors after update
    /**
     * @type {OnepanelGui.SpaceDetails}
     */
    space: reads('spaceProxy.content'),

    /**
     * The newest version of known space occupancy level
     * @type {number}
     */
    _updatedSpaceOccupancy: undefined,

    /**
     * Last resolved SpaceDetails
     * @type {SpaceDetails}
     */
    _spaceCache: null,

    /**
     * @type {Ember.ComputedProperty<number>}
     */
    _thisProviderSupportSize: computed(
      'spaceSupportersProxy.content',
      function () {
        const spaceSupporters = this.get('spaceSupportersProxy.content');
        if (typeof spaceSupporters === 'object') {
          const thisProviderSupport =
            _.find(spaceSupporters, { isCurrentProvider: true }) || {};
          return thisProviderSupport.size;
        } else {
          return undefined;
        }
      }
    ),

    /**
     * Space occupancy used to prepare used-space chart.
     * @type {Ember.ComputedProperty<number|undefined>}
     */
    _spaceOccupancy: computed(
      'space.spaceOccupancy',
      '_updatedSpaceOccupancy',
      function () {
        const preloadedSpaceOccupancy = this.get('space.spaceOccupancy');
        const _updatedSpaceOccupancy = this.get('_updatedSpaceOccupancy');
        return typeof _updatedSpaceOccupancy === 'number' ?
          _updatedSpaceOccupancy : preloadedSpaceOccupancy;
      }
    ),

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
    importProperties: computed('space.{storageImport,content}', function () {
      let space = this.get('space');
      // support for ObjectProxy
      if (space != null && space.content != null) {
        space = space.get('content');
      }
      let storageImport = get(space, 'storageImport');
      return storageImport != null ?
        Object.keys(storageImport).filter(p =>
          get(storageImport, p) != null && !_.includes(SKIPPED_IMPORT_PROPERTIES, p)
        ) : [];
    }),

    /**
     * List of specific non-empty, type-specific storage update properties
     * @type {Array}
     */
    updateProperties: computed('space.{storageUpdate,content}', function () {
      let space = this.get('space');
      // support for ObjectProxy
      if (space != null && space.content != null) {
        space = space.get('content');
      }
      let storageUpdate = get(space, 'storageUpdate');
      return storageUpdate != null ?
        Object.keys(storageUpdate).filter(p =>
          get(storageUpdate, p) != null && !_.includes(SKIPPED_UPDATE_PROPERTIES, p)
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
      const provider = this.get('provider');
      this.set(
        'spaceSizeForProvider',
        readOnly(`space.supportingProviders.${get(provider, 'id')}`)
      );
    },

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
      submitModifySpace(modifySpaceData) {
        return this.get('submitModifySpace')(modifySpaceData)
          .then(() => {
            safeExec(this, 'set', 'importConfigurationOpen', false);
            const updateStrategy = get(modifySpaceData, 'storageUpdate.strategy');
            const importStrategy = get(modifySpaceData, 'storageImport.strategy');
            if ((updateStrategy && updateStrategy !== 'no_update') ||
              (importStrategy && importStrategy !== 'no_import')) {
              safeExec(this, 'set', 'statsFrozen', false);
            }
          });
      },
      updateFilesPopularity(filesPopularity) {
        return this.get('submitModifySpace')({ filesPopularity });
      },
      updateAutoCleaning(autoCleaning) {
        return this.get('submitModifySpace')({ autoCleaning });
      },
      spaceOccupancyChanged(spaceOccupancy) {
        this.set('_updatedSpaceOccupancy', spaceOccupancy);
      },
    },
  });
