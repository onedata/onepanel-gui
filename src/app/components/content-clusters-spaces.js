/**
 * A content page for managing cluster's spaces
 *
 * @module components/content-clusters-spaces.js
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

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
            Promise.all(spacesProxies).then(spaces =>
              spaces.findBy('id', selectedSpaceId)
            )
          ),
        });
      }
    }),

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
      return this.get('navigationState').setAspectOptions({
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
        let spaceName = get(space, 'name');
        let spaceId = get(space, 'id');
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
      closeCeaseSupportModal({ confirmed, success } = {}) {
        safeExec(this, 'set', 'spaceToRevoke', null);
        if (confirmed) {
          if (success) {
            this.showSpacesList();
          }
          this.updateSpacesProxy();
        }
      },
      updateSpacesProxy() {
        return this.updateSpacesProxy();
      },
    },
  });
