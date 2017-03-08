import Ember from 'ember';

const {
  computed
} = Ember;

/**
 * Inserts a icon from oneicons font.
 * Typical usage: ``{{one-icon icon='home'}}``
 * @module components/one-icon
 * @author Jakub Liput
 * @copyright (C) 2016 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  tagName: 'span',
  classNames: ['one-icon', 'oneicon'],
  classNameBindings: ['iconClass'],

  // defaults
  icon: 'checkbox-x',
  color: '',
  addClass: '',

  iconClass: computed('icon', function () {
    return `oneicon-${this.get('icon')}`;
  }),
});
