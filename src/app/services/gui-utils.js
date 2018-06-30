/**
 * Provides data and implementation of utils specific for onepanel gui.
 *
 * @module services/gui-utils
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import GuiUtils from 'onedata-gui-common/services/gui-utils';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject } from '@ember/service';
import _ from 'lodash';

export default GuiUtils.extend({
  onepanelServer: inject(),

  /**
   * Panel type: provider or zone.
   * @type {Ember.ComputedProperty<string>}
   */
  serviceType: reads('onepanelServer.serviceType'),

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
});
