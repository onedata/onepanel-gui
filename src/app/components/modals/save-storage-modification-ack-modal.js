/**
 * A modal that allows accept or cancel storage options modification.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { resolve } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

/**
 * @typedef {Object} SaveStorageModificationAckModalOptions
 * @property {Array<SaveStorageModificationAction.WarningType>} warnings
 */

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.saveStorageModificationAckModal',

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  /**
   * @virtual
   * @type {SaveStorageModificationAckModalOptions}
   */
  modalOptions: undefined,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {boolean}
   */
  isCheckboxChecked: false,

  /**
   * @type {ComputedProperty<SaveStorageModificationAckModalOptions['warnings']>}
   */
  warnings: reads('modalOptions.warnings'),

  /**
   * @type {ComputedProperty<Array<SafeString>>}
   */
  warningText: computed('warnings', function warningText() {
    if (this.warnings.includes('qos')) {
      return this.t('warnings.qos');
    }
    return '';
  }),

  actions: {
    submit(submitCallback) {
      this.set('isSubmitting', true);
      return resolve(submitCallback())
        .finally(() => safeExec(this, () => this.set('isSubmitting', false)));
    },
  },
});
