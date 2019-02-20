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
import { resolve, reject, defer } from 'rsvp';
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

    /**
     * @override
     */
    i18nPrefix: 'components.contentClustersSpaces',

    selectedSpaceId: undefined,

    selectedTab: undefined,

    spaceToRevoke: undefined,

    /**
     * Used to confirm proceeding with deployment if DNS setup is not valid
     * @type {RSVP.Deferred}
     */
    confirmRevokeDefer: null,

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

    _modifySpace(id, data) {
      return this.get('spaceManager').modifySpaceDetails(id, data);
    },

    revokeSpace() {
      const {
        spaceToRevoke: space,
        globalNotify,
      } = this.getProperties('spaceToRevoke', 'globalNotify');
      try {
        const spaceName = get(space, 'name');
        return this.get('spaceManager').revokeSpaceSupport(get(space, 'id'))
          .then(() => {
            globalNotify.info(this.t('revokeSuccess', { spaceName }));
          })
          .catch(error => {
            globalNotify.backendError(this.t('revocationAction'), error);
            throw error;
          })
          .finally(() => {
            this.updateSpacesProxy();
          });
      } catch (error) {
        return reject(error);
      }
    },

    /**
     * @override
     */
    fetchProvider() {
      return this.get('providerManager').getProviderDetails();
    },

    /**
     * @override
     */
    fetchSpaces() {
      return this.get('spaceManager').getSpaces();
    },

    actions: {
      startRevokeSpace(space) {
        this.set('spaceToRevoke', space);
        return this.set('confirmRevokeDefer', defer()).promise;
      },
      modifySpace(space, data) {
        const globalNotify = this.get('globalNotify');
        let spaceName = get(space, 'name');
        let spaceId = get(space, 'id');
        return this._modifySpace(spaceId, data)
          .then(() => {
            globalNotify.info(this.t('configurationChanged', { spaceName }));
          })
          .catch(error => {
            // TODO: handle error on higher levels to produce better message
            globalNotify.backendError(
              this.t('configurationAction', { spaceName }),
              error
            );
            throw error;
          });
      },
      confirmRevokeModal(confirmed) {
        const action = confirmed ? this.revokeSpace() : resolve();
        return action.finally(() => {
          safeExec(this, 'set', 'spaceToRevoke', null);
          this.get('confirmRevokeDefer').resolve(confirmed);
        });
      },
      updateSpacesProxy() {
        return this.updateSpacesProxy();
      },
    },
  });
