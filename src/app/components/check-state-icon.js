/**
 * Renders icon for success or failure state (eg. for DNS check state table item)
 * 
 * @module components/check-state-icon
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  /**
   * @virtual
   * If true, icon shows success mark, otherwise shows fail
   * @type {boolean}
   */
  success: undefined,
});
