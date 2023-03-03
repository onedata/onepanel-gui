/**
 * Finish deployment screen
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['new-cluster-summary'],

  onezoneGui: service(),
  guiUtils: service(),
  onepanelConfiguration: service(),
  onepanelServer: service(),

  i18nPrefix: 'components.newClusterSummary',

  /**
   * @virtual
   * @type {string}
   */
  clusterId: null,

  /**
   * @virtual
   * @type {Function}
   */
  finish: notImplementedIgnore,

  isEmergencyOnepanel: reads('onepanelServer.isEmergency'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  serviceType: reads('onepanelConfiguration.serviceType'),

  onepanelUrl: computed(function onepanelUrl() {
    if (this.get('isEmergencyOnepanel')) {
      return location.origin;
    } else {
      return 'https://' + this.get('onepanelServer.apiOrigin') + ':9443';
    }
  }),

  actions: {
    manageNewCluster() {
      return this.get('finish')();
    },
  },
});
