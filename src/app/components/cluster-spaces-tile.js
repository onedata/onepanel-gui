/**
 * Renders a tile with supported spaces chart.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.clusterSpacesTile',

  /**
   * @virtual
   * @type {PromiseObject<Provider>}
   */
  providerIdProxy: undefined,

  /**
   * @virtual
   * @type {PromiseArray<Space>}
   */
  spacesProxy: undefined,
});
