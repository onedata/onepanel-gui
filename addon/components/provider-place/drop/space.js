/**
 * A list entry for single space in context of particular provider
 * in provider-place/drop component.
 * 
 * @module components/provider-place/drop/space
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/provider-place/drop/space';
import ProviderSpace from 'onedata-gui-common/mixins/components/provider-space';

export default Component.extend(ProviderSpace, {
  layout,
  tagName: 'div',
  classNames: ['provider-place-drop-space']
});
