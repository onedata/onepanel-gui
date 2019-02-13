import Component from '@ember/component';
import SpaceTabs from 'onepanel-gui/mixins/components/space-tabs';
import SpaceItemSyncStats from 'onepanel-gui/mixins/components/space-item-sync-stats';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default Component.extend(
  SpaceItemSyncStats,
  SpaceTabs,
  I18n,
  GlobalActions,
  createDataProxyMixin('filePopularityConfiguration'),
  createDataProxyMixin('autoCleaningConfiguration'), {
    classNames: ['content-clusters-spaces-show'],

    onepanelServer: service(),
    spaceManager: service(),
    storageManager: service(),
    router: service(),

    /** @override */
    i18nPrefix: 'components.contentClustersSpacesShow',

    space: undefined,

    startRevokeSpace: notImplementedThrow,

    /**
     * The newest version of known space occupancy level
     * @type {number}
     */
    _updatedSpaceOccupancy: undefined,

    /**
     * If true, this space has synchronization import enabled
     *
     * That means, the view should be enriched with sync statuses and statistics
     * @type {computed.boolean}
     */
    _importActive: reads('space.importEnabled'),

    /**
     * @type {Ember.ComputedProperty<Action>}
     */
    _revokeSpaceAction: computed('startRevokeSpace', 'space', function _revokeSpaceAction() {
      const startRevokeSpace = this.get('startRevokeSpace');
      const space = this.get('space');
      return {
        action: () => startRevokeSpace(space)
          .then(confirmed => confirmed && this.goToSpacesList.bind(this)()),
        title: this.t('revokeSpaceSupport'),
        icon: 'remove',
        class: 'btn-revoke-space-support',
        buttonStyle: 'danger',
      };
    }),

    /**
     * @override
     */
    globalActions: computed('_revokeSpaceAction', function globalActions() {
      const _revokeSpaceAction = this.get('_revokeSpaceAction');
      return [_revokeSpaceAction];
    }),

    init() {
      this._super(...arguments);
      this.get('providerProxy').then(provider => {
        this.set(
          'spaceSizeForProvider',
          reads(`space.supportingProviders.${get(provider, 'id')}`)
        );
      });
      this.updateAutoCleaningConfigurationProxy();
      this.updateFilePopularityConfigurationProxy();
    },

    goToSpacesList() {
      return this.get('router').transitionTo({ queryParams: { options: '' } });
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
      configureFilePopularity(configuration) {
        const spaceId = this.get('space.id');
        return this.get('onepanelServer').request(
            'oneprovider',
            'configureFilePopularity',
            spaceId,
            configuration
          )
          .then(() => {
            if (configuration && get(configuration, 'enabled') === false) {
              // failure of this will not cause fail of configureFilePopularity
              this.updateAutoCleaningConfigurationProxy({ replace: true });
            }
            return this.updateFilePopularityConfigurationProxy({ replace: true });
          });
      },
      configureSpaceAutoCleaning(configuration) {
        const spaceId = this.get('space.id');
        return this.get('onepanelServer').request(
          'oneprovider',
          'configureSpaceAutoCleaning',
          spaceId,
          configuration
        ).then(() => {
          return this.updateAutoCleaningConfigurationProxy({ replace: true });
        });
      },
      spaceOccupancyChanged(spaceOccupancy) {
        return this.set('_updatedSpaceOccupancy', spaceOccupancy);
      },
      modifySpace(data) {
        const spaceId = this.get('space.id');
        const spaceManager = this.get('spaceManager');
        return this.get('modifySpace')(data)
          .then(() => spaceManager.updateSpaceDetailsCache(spaceId));
      },
    },
  });
