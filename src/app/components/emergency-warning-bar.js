/**
 * Renders a bottom bar that informs user about being on the emergency Onepanel
 * 
 * @module components/emergency-warning-bar
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { computed } from '@ember/object';
import { reads, not } from '@ember/object/computed';

export default Component.extend(
  createDataProxyMixin('visitViaOnezoneUrl'),
  I18n, {
    tagName: '',

    onezoneGui: service(),
    onepanelServer: service(),
    guiUtils: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.emergencyWarningBar',

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    onezoneOrigin: reads('onezoneGui.onezoneOrigin'),

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    onepanelServiceType: reads('guiUtils.serviceType'),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    workerIsUnavailable: not('onepanelServer.workerServicesAreAvailable'),

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    workerIsUnavailableText: computed(
      'workerIsUnavailable',
      'onepanelServiceType',
      function workerIsUnavailableText() {
        const {
          workerIsUnavailable,
          onepanelServiceType,
        } = this.getProperties('workerIsUnavailable', 'onepanelServiceType');
        if (workerIsUnavailable) {
          const translationName = onepanelServiceType === 'onezone' ?
            'onezoneUnavailable' : 'oneproviderUnavailable';
          return this.t(translationName);
        } else {
          return undefined;
        }
      }
    ),

    init() {
      this._super(...arguments);
      this.updateVisitViaOnezoneUrlProxy();
    },

    /**
     * @override
     * Url to onepanel gui hosted by onezone or null if onezone is not available
     */
    fetchVisitViaOnezoneUrl() {
      const onezoneGui = this.get('onezoneGui');
      return onezoneGui.getCanEnterViaOnezoneProxy()
        .then(canEnterViaOnezone => {
          return canEnterViaOnezone ?
            onezoneGui.getOnepanelNavUrlInOnezone() :
            null;
        });
    },
  }
);
