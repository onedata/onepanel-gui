/**
 * Add hosted and emergency Onepanel specific features to common user-account-button
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';

import {
  menuItemClassesDesktop,
  menuItemClassesMobile,
} from 'onedata-gui-common/components/user-account-button-base';

export default Component.extend(I18n, {
  tagName: '',

  onepanelServer: service(),
  guiUtils: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.userAccountButton',

  /**
   * @virtual
   * @type {boolean}
   */
  isActive: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  mobileMode: undefined,

  /**
   * @virtual optional
   * @type {(opened: boolean) => void}
   */
  onMenuOpened: undefined,

  /**
   * @virtual optional
   * @type {(targetResourceType: string) => void}
   */
  onItemClick: undefined,

  /**
   * @type {ComputedProperty<boolean>}
   */
  username: reads('onepanelServer.username'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isEmergencyOnepanel: reads('onepanelServer.isEmergency'),

  menuItemClasses: computed('mobileMode', function menuItemClasses() {
    return this.mobileMode ? menuItemClassesMobile : menuItemClassesDesktop;
  }),

  actions: {
    logout() {
      return this.guiUtils.logout();
    },
  },
});
