/**
 * Opens confirmation modal for enabling OneS3 on specified host of cluster and provides
 * process exeuction and progress handling.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import Locale from 'onedata-gui-common/utils/locale';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

/**
 * @typedef {Object} EnableS3ActionContext
 * @param {string} hostnames Hostnames to enable OneS3 on the cluster.
 * @param {number} port Port on which OneS3 will function. Respected by backend only if
 *   this is first OneS3 deployment on this cluster.
 */

export default class EnableS3Action extends Action {
  @service
  modalManager;

  locale = new Locale('utils.enableS3Action');

  /**
   * @virtual
   * @type {EnableS3ActionContext}
   */
  context;

  /**
   * @private
   * @type {EnableS3ActionContext['hostnames']}
   */
  get hostnames() {
    return this.context.hostnames;
  }

  /**
   * @private
   * @type {EnableS3ActionContext['port']}
   */
  get port() {
    return this.context.port;
  }

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();

    const modal = this.modalManager.show('enable-s3-modal', {
      hostnames: this.hostnames,
      port: this.port,
      onSuccess: () => {
        modal.api.close();
        safeExec(this, () => {
          result.set('status', 'done');
          this.globalNotify.success(this.locale.t('deployedSuccessfully'));
        });
      },
      onFailure: (error) => {
        modal.api.close();
        safeExec(this, () => {
          result.setProperties({
            status: 'failed',
            error,
          });
          this.globalNotify.backendError(this.locale.t('deployingOneS3'), error);
        });
      },
    });

    await modal.hiddenPromise;
    result.cancelIfPending();
    return result;
  }
}
