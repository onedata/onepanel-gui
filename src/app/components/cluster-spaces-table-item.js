/**
 * Details about support provided for space
 *
 * @module components/cluster-spaces-table-item.js
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { readOnly } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import SpaceItemSyncStats from 'onepanel-gui/mixins/components/space-item-sync-stats';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

const I18N_PREFIX = 'components.clusterSpacesTableItem.';

export default Component.extend(
  SpaceItemSyncStats,
  createDataProxyMixin('filePopularityConfiguration'),
  createDataProxyMixin('autoCleaningConfiguration'),
  I18n, {
    // needed for text ellipsis inside
    tagName: 'span',

    classNames: ['cluster-spaces-table-item'],

    i18n: service(),

    storageManager: service(),
    onepanelServer: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.clusterSpacesTableItem',

    /**
     * @virtual
     * @type {function}
     */
    submitModifySpace: undefined,

    startRevoke: notImplementedThrow,

    /**
     * OneCollapsibleListItem that should be used to render this
     * To inject.
     * @type {Component.OneCollapsibleListItem}
     */
    listItem: null,

    /**
     * @type {OnepanelGui.SpaceDetails}
     */
    space: null,

    /**
     * @type {ProviderDetails}
     */
    provider: null,

    /**
     * Last resolved SpaceDetails
     * @type {SpaceDetails}
     */
    _spaceCache: null,

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

    init() {
      this._super(...arguments);
      this.updateFilePopularityConfigurationProxy();
      this.updateAutoCleaningConfigurationProxy();
    },

    fetchFilePopularityConfiguration() {
      const spaceId = this.get('space.id');
      return this.get('onepanelServer').request(
          'oneprovider',
          'getFilePopularityConfiguration',
          spaceId
        )
        .then(({ data }) => data);
    },

    fetchAutoCleaningConfiguration() {
      const spaceId = this.get('space.id');
      return this.get('onepanelServer').request(
          'oneprovider',
          'getSpaceAutoCleaningConfiguration',
          spaceId
        )
        .then(({ data }) => data);
    },

    actions: {
      startRevokeSpace() {
        return this.get('startRevokeSpace')(this.get('space'));
      },
      revokeSpace() {
        const {
          revokeSpace,
          space,
        } = this.getProperties('revokeSpace', 'space');
        return revokeSpace(space);
      },
    },
  });
