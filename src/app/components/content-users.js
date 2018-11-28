/**
 * Implements operations on user for onepanel
 * Extends `onedata-gui-common/components/content-users`
 *
 * @module components/content-users
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Onepanel from 'npm:onepanel';
import Component from '@ember/component';
import layout from 'onepanel-gui/templates/components/content-users';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { CLUSTER_INIT_STEPS } from 'onepanel-gui/models/cluster-details';

const {
  UserModifyRequest,
} = Onepanel;

export default Component.extend(I18n,
  createDataProxyMixin('onezoneAccount'),
  createDataProxyMixin('clusterDetails'), {
    layout,

    classNames: 'content-users',

    onepanelServer: service(),
    guiUtils: service(),
    clusterManager: service(),
    userManager: service(),
    i18n: service(),
    globalNotify: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentUsers',

    /**
     * If true, set credentials form to changingPassword mode
     * @type {boolean}
     */
    _changingPassword: false,

    _changePasswordButtonClass: computed('_changingPassword', function () {
      return this.get('_changingPassword') ?
        'btn-change-password-cancel' : 'btn-change-password-start';
    }),

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    onepanelServiceType: reads('guiUtils.serviceType'),

    /**
     * @override
     */
    fetchClusterDetails() {
      return this.get('clusterManager').getClusterDetails();
    },

    /**
     * To inject.
     * @type {OnepanelGui.UserDetails}
     */
    user: null,

    canBeLinked: computed(
      'onepanelServiceType',
      'clusterDetails.initStep',
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

    fetchOnezoneAccount() {
      return this.get('userManager').getUserLink();
    },

    actions: {
      /**
       * Make an API call to change password of current user
       * and handles promise resolve, reject
       * 
       * @param {string} currentPassword
       * @param {string} newPassword
       * @returns {Promise} an API call promise, resolves on change password success
       */
      submitChangePassword(currentPassword, newPassword) {
        let {
          i18n,
          globalNotify,
        } = this.getProperties(
          'i18n',
          'globalNotify'
        );

        let changingPassword = this._changePassword({ currentPassword, newPassword });

        changingPassword.catch(error => {
          globalNotify.backendError(
            i18n.t('components.contentUsers.passwordChangedSuccess'),
            error
          );
        });

        changingPassword.then(() => {
          globalNotify.info(
            i18n.t('components.contentUsers.passwordChangedSuccess')
          );
          this.set('_changingPassword', false);
        });

        return changingPassword;
      },
    },

  });
