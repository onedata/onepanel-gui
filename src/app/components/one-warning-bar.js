/**
 * A fixed bottom bar with information and modal.
 * 
 * @module components/one-warning-bar
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  classNames: ['one-warning-bar'],

  infoOpened: false,

  actions: {
    toggleInfoModal(open) {
      this.set('infoOpened', open);
    },
  },
});
