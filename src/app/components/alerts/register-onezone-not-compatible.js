/**
 * Content for alert modal showing error when Onezone to register in
 * is not compatible with Oneprovider deployed with this Onepanel
 * 
 * @module components/alerts/register-onezone-not-compatible
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

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
   * @type {ComputedProperty<Array<string>>}
   */
  supportedVersions: reads('options.supportedVersions'),
});
