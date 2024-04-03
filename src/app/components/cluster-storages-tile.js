/**
 * Renders a tile with storages number.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { reads } from '@ember/object/computed';
import { gt, conditional, raw } from 'ember-awesome-macros';

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

  storagesCount: reads('storagesCountProxy.content'),

  storagesNumberClass: conditional(
    gt('storagesCount', raw(999)),
    raw('storages-number-many-digits'),
    raw('')
  ),
});
