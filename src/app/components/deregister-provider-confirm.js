/**
 * Deregister provider confirmation
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default Component.extend(I18n, {
  classNames: 'deregister-provider-confirm',
  i18nPrefix: 'components.deregisterProviderConfirm',

  /**
   * @virtual
   * @type {Function}
   * @returns {Promise|undefined}
   */
  submitAction: notImplementedThrow,

  /**
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  closeAction: notImplementedThrow,
});
