/**
 * Renders a tile with storages number.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.clusterStoragesTile',

  /**
   * @virtual
   * @type {PromiseObject<number>}
   */
  storagesCountProxy: undefined,
});
