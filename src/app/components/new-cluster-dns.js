/**
 * Cluster init step: configuring DNS (for Onezone) and checking its configuration
 *
 * @module components/new-cluster-dns
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads, notEmpty, or } from '@ember/object/computed';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { resolve, defer, reject } from 'rsvp';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default Component.extend(I18n, {
  classNames: ['new-cluster-dns'],

  onepanelServer: service(),
  globalNotify: service(),
  guiUtils: service(),

  i18nPrefix: 'components.newClusterDns',

  /**
   * @virtual
   * @type {function}
   */
  prevStep: notImplementedThrow,

  /**
   * @virtual
   * @type {function}
   */
  nextStep: notImplementedThrow,

  workProxy: undefined,

  isWorking: reads('workProxy.isPending'),

  /**
   * Used to confirm proceeding with deployment if DNS setup is not valid
   * @type {RSVP.Deferred}
   */
  confirmProceedDefer: null,

  lastCheckStatus: undefined,

  performCheckDone: notEmpty('lastCheckStatus'),

  proceedEnabled: or('isIpDomain', 'performCheckDone'),

  onepanelServiceType: reads('guiUtils.serviceType'),

  confirmProceedModalOpened: notEmpty('confirmProceedDefer'),

  confirmProceed() {
    if (this.get('lastCheckStatus') === true) {
      return resolve(true);
    } else {
      const confirmProceedDefer = defer();
      this.set('confirmProceedDefer', confirmProceedDefer);
      return confirmProceedDefer.promise;
    }
  },

  acknowledgeDnsCheck() {
    const promise = this.get('onepanelServer')
      .request('onepanel', 'modifyDnsCheckConfiguration', {
        dnsCheckAcknowledged: true,
      })
      .catch(error => {
        this.get('globalNotify').backendError(
          this.tt('acknowledgingDnsCheck'),
          error
        );
      });
    this.set('workProxy', PromiseObject.create({ promise }));
    return promise;
  },

  actions: {
    proceed() {
      if (this.get('proceedEnabled')) {
        return this.confirmProceed()
          .then(confirmed => {
            this.set('confirmProceedDefer', null);
            if (confirmed) {
              return this.acknowledgeDnsCheck()
                .then(() => this.get('nextStep')());
            } else {
              return resolve();
            }
          });
      } else {
        return reject();
      }
    },
    back() {
      this.get('prevStep')();
    },
    confirmProceedModal(confirmed) {
      this.get('confirmProceedDefer').resolve(confirmed);
    },
  },

});
