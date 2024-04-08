/**
 * A container component with information about Onezone
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  classNames: ['onezone-info-box'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.onezoneInfoBox',

  /**
   * @virtual
   * @type {Onepanel.OnezoneInfo}
   */
  onezoneInfo: undefined,
});
