/**
 * Renders warning message as list item for static list field in web cert form
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';

/**
 * An alert with warning inside the static web certificate form.
 *
 * @typedef {Object} WebCertFormWarningItemOptions
 * @property {SafeString} warningTip
 * @property {SafeString} warningText
 */

@tagName('')
export default class extends Component {
  constructor() {
    super(...arguments);

    /**
     * @virtual
     * @type {Utils.FormComponent.FormField}
     */
    this.field;

    /**
     * @virtual
     * @type {WebCertFormWarningItemOptions}
     */
    this.options;
  }
}
