/**
 * Content for alert modal showing error when trying to register Oneprovider
 * in Onezone that is not compatible with it.
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  tagName: '',

  i18nPrefix: 'components.alerts.registerOnezoneNotCompatible',

  /**
   * @override
   * @type {object}
   */
  options: undefined,

  /**
   * Onezone domain
   * @type {ComputedProperty<string>}
   */
  domain: reads('options.domain'),

  /**
   * @type {ComputedProperty<string>}
   */
  oneproviderVersion: reads('options.oneproviderVersion'),

  /**
   * @type {ComputedProperty<string>}
   */
  onezoneVersion: reads('options.onezoneVersion'),
});
