/**
 * Shows short information about members (emergency GUI) or redirects
 * to Onezone (hosted GUI).
 *
 * @module components/content-cluster-members
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(
  I18n,
  createDataProxyMixin('userInvitationToken'), {
    classNames: ['content-clusters-members'],

    onepanelServer: service(),
    onezoneGui: service(),
    memberManager: service(),
    i18n: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentClustersMembers',

    /**
     * @type {Onepanel.ClusterDetails}
     * @virtual
     */
    cluster: undefined,

    /**
     * @type {boolean}
     */
    isUserTokenVisible: false,

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    isOnepanelEmergency: reads('onepanelServer.isEmergency'),

    /**
     * @type {Ember.ComputedProperty<PromiseObject>}
     */
    membersProxy: reads('memberManager.membersProxy'),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    hasNoConnectedUser: reads('memberManager.hasNoConnectedUser'),

    /**
     * @overrides
     * @returns {Promise<Onepanel.Token>}
     */
    fetchUserInvitationToken() {
      return this.get('memberManager').createUserInvitationToken();
    },

    actions: {
      manageViaOnezone() {
        const onezoneGui = this.get('onezoneGui');
        const url = onezoneGui.getOnepanelNavUrlInOnezone({
          redirectType: 'onezone_route',
        }) + '/members';
        return new Promise(() => {
          window.location = url;
        });
      },
      showUserToken() {
        this.set('isUserTokenVisible', true);
        this.updateUserInvitationTokenProxy();
      },
      generateAnotherToken() {
        this.updateUserInvitationTokenProxy();
      },
    },
  }
);
