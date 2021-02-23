/**
 * Additional computed properties for backend and cluster-model-manager cluster
 * data.
 * 
 * @module models/cluster
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { reads } from '@ember/object/computed';
import validateOnepanelConnection from 'onedata-gui-common/utils/validate-onepanel-connection';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { resolve, reject } from 'rsvp';
import { inject as service } from '@ember/service';
import {
  onepanelAbbrev,
} from 'onedata-gui-common/utils/onedata-urls';
import $ from 'jquery';

export default EmberObject.extend(
  createDataProxyMixin('isOnline'),
  createDataProxyMixin('standaloneOrigin'), {
    onepanelServer: service(),

    /**
     * @virtual
     * @type {string|ComputedProperty<string>}
     */
    domain: undefined,

    /**
     * @virtual
     * @type {boolean}
     */
    isLocal: undefined,

    /**
     * @virtual
     * @type {String}
     */
    id: undefined,

    /**
     * Compatibility with onezone-gui
     * @type {ComputedProperty<String>}
     */
    entityId: reads('id'),

    /**
     * @override
     */
    fetchStandaloneOrigin() {
      if (this.get('isLocal')) {
        return resolve('https://' + this.get('onepanelServer.apiOrigin'));
      } else {
        return this.fetchRemoteGuiContext().then(({ apiOrigin }) =>
          'https://' + apiOrigin
        );
      }
    },

    /**
     * @override
     */
    fetchIsOnline() {
      if (this.get('isLocal')) {
        return resolve(true);
      } else {
        const {
          standaloneOriginProxy,
          entityId,
        } = this.getProperties('standaloneOriginProxy', 'entityId');
        return standaloneOriginProxy.then(standaloneOrigin => {
          return validateOnepanelConnection(standaloneOrigin, entityId);
        });
      }
    },

    fetchRemoteGuiContext() {
      if (this.get('onepanelServer.isEmergency')) {
        return reject(
          'model:cluster#fetchStandaloneOrigin: cannot fetch gui context for remote cluster in emergency mode'
        );
      } else {
        const guiContextPath =
          `${location.origin}/${onepanelAbbrev}/${this.get('id')}/gui-context`;
        return resolve($.get(guiContextPath));
      }
    },
  }
);
