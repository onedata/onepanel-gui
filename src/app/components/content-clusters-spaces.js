/**
 * A content page for managing cluster's spaces
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { all as allFulfilled } from 'rsvp';

export default Component.extend(
  I18n,
  createDataProxyMixin('provider'),
  createDataProxyMixin('spaces'), {

    classNames: ['content-clusters-spaces'],

    spaceManager: service(),
    providerManager: service(),
    globalNotify: service(),
    i18n: service(),
    navigationState: service(),
    onezoneGui: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentClustersSpaces',

    selectedSpaceId: undefined,

    selectedTab: undefined,

    spaceToRevoke: undefined,

    // TODO: please forgive me for this code, it's because of lack of good cacheing
    selectedSpaceProxy: computed('selectedSpaceId', function selectedSpaceProxy() {
      const selectedSpaceId = this.get('selectedSpaceId');
      if (selectedSpaceId) {
        return PromiseObject.create({
          promise: this.get('spacesProxy').then(spacesProxies =>
            allFulfilled(spacesProxies).then(spaces =>
              spaces.findBy('id', selectedSpaceId)
            )
          ),
        });
      }
    }),

    /**
     * @type {ComputedProperty<String>}
     */
    removeSpaceToRevokeUrl: computed(
      'spaceToRevoke',
      function removeSpaceToRevokeUrl() {
        const spaceId = this.get('spaceToRevoke.id');
        if (!spaceId) {
          return;
        }
        return this.get('onezoneGui').getUrlInOnezone(
          `onedata/spaces/${spaceId}?action_name=removeSpace&action_space_id=${spaceId}`
        );
      }
    ),

    init() {
      this._super(...arguments);
      this.updateProviderProxy();
      this.updateSpacesProxy();
    },

    /**
     * @override
     */
    fetchProvider() {
      return this.get('providerManager').getProviderDetailsProxy();
    },

    /**
     * @override
     */
    fetchSpaces() {
      return this.get('spaceManager').getSpaces();
    },

    modifySpace(id, data) {
      return this.get('spaceManager').modifySpaceDetails(id, data);
    },

    showSpacesList() {
      return this.get('navigationState').changeRouteAspectOptions({
        space: null,
        tab: null,
      });
    },

    actions: {
      startRevokeSpace(space) {
        this.set('spaceToRevoke', space);
      },
      modifySpace(space, data) {
        const globalNotify = this.get('globalNotify');
        const spaceName = get(space, 'name');
        const spaceId = get(space, 'id');
        return this.modifySpace(spaceId, data)
          .then(() => {
            globalNotify.info(this.t('configurationChanged', { spaceName }));
          })
          .catch(error => {
            globalNotify.backendError(
              this.t('configurationAction', { spaceName }),
              error
            );
            throw error;
          });
      },
      closeCeaseSupportModal() {
        safeExec(this, 'set', 'spaceToRevoke', null);
      },
      updateSpacesProxy() {
        return this.updateSpacesProxy();
      },
    },
  });
