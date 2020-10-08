/**
 * Details about support provided for space
 *
 * @module components/cluster-spaces-table-item.js
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import SpaceItemImportStats from 'onepanel-gui/mixins/components/space-item-import-stats';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-throw';

export default Component.extend(
  SpaceItemImportStats,
  createDataProxyMixin('filePopularityConfiguration'),
  createDataProxyMixin('autoCleaningConfiguration'),
  I18n, {
    // needed for text ellipsis inside
    tagName: 'span',

    classNames: ['cluster-spaces-table-item'],

    i18n: service(),
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
     * Opens revoke space support modal
     * @virtual
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
     * If true, this space has auto storage import enabled
     *
     * That means, the view should be enriched with import statuses and statistics
     * @type {ComputedProperty<boolean>}
     */
    autoImportActive: reads('space.autoStorageImportEnabled'),

    init() {
      this._super(...arguments);
      this.updateFilePopularityConfigurationProxy();
      this.updateAutoCleaningConfigurationProxy();
    },

    fetchFilePopularityConfiguration() {
      const spaceId = this.get('space.id');
      return this.get('onepanelServer').request(
          'FilePopularityAndAutoCleaningApi',
          'getFilePopularityConfiguration',
          spaceId
        )
        .then(({ data }) => data);
    },

    fetchAutoCleaningConfiguration() {
      const spaceId = this.get('space.id');
      return this.get('onepanelServer').request(
          'FilePopularityAndAutoCleaningApi',
          'getSpaceAutoCleaningConfiguration',
          spaceId
        )
        .then(({ data }) => data);
    },
  });
