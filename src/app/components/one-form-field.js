/**
 * A form field tailored for Onedata application, used mainly in ``one-form-fields``
 *
 * @module components/one-form-field
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  computed,
  String: { htmlSafe },
} = Ember;

export default Ember.Component.extend({
  tagName: '',

  field: null,
  inputClass: computed('field.name', function () {
    return htmlSafe(`field-${this.get('field.name')}`);
  }),

  actions: {
    inputChanged() {
      invokeAction(this, 'inputChanged', ...arguments);
    },
    onFocusOut() {
      // prevents double render issue by scheduling focusout event handler on
      // events' loop end
      setTimeout(() => invokeAction(this, 'onFocusOut', ...arguments), 0);
    }
  }
});
