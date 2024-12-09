/**
 * Renders warning message as list item for static list field in web cert form
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class extends Component {
  constructor() {
    super(...arguments);
    /**
     * @virtual
     * @type {Utils.FormComponent.FormField}
     */
    this.field;
  }
}
