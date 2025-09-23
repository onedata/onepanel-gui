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

/**
 * @typedef {Object} EnableS3ActionContext
 * @param {string} hostnames Hostnames to enable OneS3 on the cluster.
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
   * @type {ComputedProperty<EnableS3ActionContext['hostnames']>}
   */
  get hostnames() {
    return this.context.hostnames;
  }

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();

    const modal = this.modalManager.show('enable-s3-modal', {
      hostnames: this.hostnames,
      onSuccess: () => {
        result.set('status', 'done');
        modal.api.close();
        this.globalNotify.success(this.locale.t('deployedSuccessfully'));
      },
      onFailure: (error) => {
        result.setProperties({
          status: 'failed',
          error,
        });
        modal.api.close();
        this.globalNotify.backendError(this.locale.t('deployingOneS3'), error);
      },
    });

    await modal.hiddenPromise;
    result.cancelIfPending();
    return result;
  }
}
