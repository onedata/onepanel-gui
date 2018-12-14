/**
 * Provides data and implementation of utils specific for onepanel gui.
 *
 * @module services/gui-utils
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import GuiUtils from 'onedata-gui-common/services/gui-utils';
import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default GuiUtils.extend(
  createDataProxyMixin('guiVersion'),
  createDataProxyMixin('guiName'), {
    onepanelServer: service(),
    clusterModelManager: service(),

    /**
     * Panel type: provider or zone.
     * @type {Ember.ComputedProperty<string>}
     */
    serviceType: reads('onepanelServer.serviceType'),

    /**
     * Just an alias - this name was used in the past
     * @type {Ember.ComputedProperty<string>}
     */
    onepanelServiceType: reads('serviceType'),

    /**
     * Full panel type name: Oneprovider or Onezone.
     * @type {Ember.ComputedProperty<string>}
     */
    fullServiceName: computed('serviceType', function () {
      const serviceType = this.get('serviceType');
      return serviceType ?
        'One' + _.lowerCase(this.t(`serviceType.${serviceType}`)) : null;
    }),

    /**
     * @override
     */
    guiType: computed('serviceType', function () {
      const serviceType = this.get('serviceType');
      return this.t(`serviceType.${serviceType}`) + ' ' + this.t('panel');
    }),

    /**
     * @override
     */
    guiIcon: 'assets/images/onepanel-logo.svg',

    init() {
      this._super(...arguments);
      this.updateGuiVersionProxy();
      this.updateGuiNameProxy();
    },

    // FIXME: allow to ask without authentication?
    fetchGuiVersion() {
      return this.get('clusterModelManager').getCurrentClusterProxy()
        .then(cluster => get(cluster, 'version'));
    },

    fetchGuiName() {
      return this.get('clusterModelManager').getCurrentClusterProxy()
        .then(cluster => get(cluster, 'name'));
    },
  });
