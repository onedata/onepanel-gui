/**
 * Renders warning icon in web cert form
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
*/

import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  /**
   * @virtual
   * @type {Utils.FormComponent.FormField}
   */
  field: undefined,
});
