/**
 * Renders an element that looks like input, but is only for display
 *
 * @module components/one-form-field-static
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  Component,
  computed,
} = Ember;

export default Component.extend({
  tagName: '',

  fieldNameClass: computed('field.name', function () {
    return `field-${this.get('field.name')}`;
  }),

  field: null,

  fakePassword: false,
});