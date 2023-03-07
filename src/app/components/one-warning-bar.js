/**
 * A fixed bottom bar with information and modal.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  classNames: ['one-warning-bar'],
  classNameBindings: ['barClasses'],

  infoOpened: false,

  /**
   * @virtual
   * @type {string}
   */
  barClasses: '',

  actions: {
    toggleInfoModal(open) {
      this.set('infoOpened', open);
    },
  },
});
