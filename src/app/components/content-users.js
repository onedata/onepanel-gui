/**
 * Implements operations on user for onepanel
 * Extends `onedata-gui-common/components/content-users`
 *
 * @module components/content-users
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// FIXME: this should not be common file

import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Onepanel from 'npm:onepanel';
import ContentUsers from 'onedata-gui-common/components/content-users';
import layout from 'onedata-gui-common/templates/components/content-users';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { resolve } from 'rsvp';
import { CLUSTER_INIT_STEPS } from 'onepanel-gui/models/cluster-details';

const {
  UserModifyRequest,
} = Onepanel;

export default ContentUsers.extend(I18n, createDataProxyMixin('onezoneAccount'), {
  layout,

  classNames: 'content-users',

  onepanelServer: service(),
  guiUtils: service(),
  clusterManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentUsers',

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  onepanelServiceType: reads('guiUtils.serviceType'),

  clusterDetailsProxy: computed(function clusterDetailsProxy() {
    return this.get('clusterManager').getClusterDetails();
  }),

  /**
   * To inject.
   * @type {OnepanelGui.UserDetails}
   */
  user: null,

  canBeLinked: computed(
    'onepanelServiceType',
    'clusterDetailsProxy.content.initStep',
    function canBeLinked() {
      const initStep = this.get('clusterDetailsProxy.content.initStep');
      if (this.get('onepanelServiceType') === 'provider') {
        return initStep >= CLUSTER_INIT_STEPS.PROVIDER_REGISTER + 1;
      } else {
        return initStep >= CLUSTER_INIT_STEPS.ZONE_DEPLOY + 1;
      }
    }),

  /**
   * Make an API call to change password of current user
   * @override
   * @param {object} data
   * @param {string} data.currentPassword
   * @param {string} data.newPassword
   * @returns {Promise} resolves on change password success
   */
  _changePassword({ currentPassword, newPassword }) {
    let {
      user,
      onepanelServer,
    } = this.getProperties(
      'user',
      'onepanelServer',
    );

    return onepanelServer.request(
      'onepanel',
      'modifyUser',
      get(user, 'id'),
      UserModifyRequest.constructFromObject({
        currentPassword,
        newPassword,
      })
    );
  },

  init() {
    this._super(...arguments);
    this.updateOnezoneAccountProxy();
  },

  // FIXME: real onezoneAccount proxy
  // FIXME: use get_current_user
  // FIXME: this should handle server rejection
  fetchOnezoneAccount() {
    return resolve({
      zoneName: 'Cyfronet AGH',
      hostname: 'localhost:4201',
      username: 'Stub User',
      alias: 'stub_user',
    });
  },

  actions: {
    // FIXME: mock
    linkOnezoneAccount() {
      window.location = 'http://localhost:4209';
    },
  },

});
