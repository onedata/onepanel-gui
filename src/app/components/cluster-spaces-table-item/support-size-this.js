/**
 * Displays and allows edit of support size of the space for single provider
 * 
 * @module components/cluster-spaces-table-item/support-size-this
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  classNames: ['support-size-this'],

  spaceManager: service(),
  globalNotify: service(),

  i18nPrefix: 'components.spaceOverview.supportSizeThis',

  /**
   * @virtual
   * @type {number}
   */
  providerSupportSize: undefined,

  /**
   * @virtual
   * @type {number}
   */
  spaceOccupancy: undefined,

  /**
   * @virtual
   * @type {function} submitModifySpace(size: number)
   */
  submitModifySpace: notImplementedReject,

  /**
   * Validate and return something-like-Validator object to display
   * validation message in size editor.
   * @type {ComputedProperty<object>} something like Validator
   */
  newTotalSizeValidator: computed(
    'newTotalSize',
    'spaceOccupancy',
    function newTotalSizeValidator() {
      const {
        newTotalSize,
        spaceOccupancy,
      } = this.getProperties('newTotalSize', 'spaceOccupancy');
      if (newTotalSize < spaceOccupancy) {
        return {
          isValid: false,
          message: this.t('errorSizeLesserThanOccupancy'),
        };
      } else {
        return {
          isValid: true,
        };
      }
    }
  ),

  submitSpaceSize(size) {
    return this.get('submitModifySpace')({ size });
  },

  actions: {
    editorStateChanged(started) {
      this.set('newTotalSize', started ? this.get('providerSupportSize') : undefined);
    },
    saveSpaceSize() {
      const {
        globalNotify,
        newTotalSize,
      } = this.getProperties(
        'globalNotify',
        'newTotalSize'
      );
      return this.submitSpaceSize(Math.floor(newTotalSize))
        .then(() => {
          next(() => {
            safeExec(this, 'set', 'newTotalSize', undefined);
          });
        })
        .catch(error => {
          globalNotify.backendError(
            this.t('modifyingSpaceSupportSize'),
            error
          );
          throw error;
        });
    },
  },
});
