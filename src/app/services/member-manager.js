/**
 * Provides function for managing members of this cluster
 *
 * @module services/member-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { equal } from '@ember/object/computed';

export default Service.extend(createDataProxyMixin('members'), {
  onepanelServer: service(),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasNoConnectedUser: equal('members.effectiveUsersCount', 0),

  /**
   * Method used by createDataProxyMixin
   * @overrides
   * @returns {Promise}
   */
  fetchMembers() {
    const onepanelServer = this.get('onepanelServer');
      return onepanelServer
        .request('onepanel', 'getClusterMembersSummary')
        .then(({ data }) => data);
  },

  /**
   * Returns promise which resolves to user invitation token for this cluster
   * @returns {Promise<Onepanel.Token>}
   */
  createUserInvitationToken() {
    const onepanelServer = this.get('onepanelServer');
    return onepanelServer
      .request('onepanel', 'createUserInviteToken')
      .then(({ data }) => data);
  },
});
