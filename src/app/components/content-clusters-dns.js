/**
 * DNS aspect of cluster
 * 
 * @module components/content-clusters-dns
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: 'content-clusters-dns',
  i18nPrefix: 'components.contentClustersDns',
});
