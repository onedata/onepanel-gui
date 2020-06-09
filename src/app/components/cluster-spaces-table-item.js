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
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-throw';

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

    /**
     * @virtual
     * Returns promise that resolves if either user confirms and succeeds to
     * revoke space (true) or cancels revocation (false).
     * The promise rejects when revocation operation fails.
     * @type {function}
     */
    startRevokeSpace: notImplementedReject,

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
     * If true, this space has storage import enabled
     *
     * That means, the view should be enriched with sync statuses and statistics
     * @type {computed.boolean}
     */
    _importActive: readOnly('space.importEnabled'),

    _importButtonActionName: computed(
      'importConfigurationOpen',
      function _importButtonActionName() {
        return this.get('importConfigurationOpen') ?
          'endImportConfiguration' :
          'startImportConfiguration';
      }
    ),

    _importButtonTip: computed(
      'importConfigurationOpen',
      function _importButtonTip() {
        return this.get('importConfigurationOpen') ?
          this.t('cancelSyncConfig') :
          this.t('syncConfig');
      }
    ),

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
