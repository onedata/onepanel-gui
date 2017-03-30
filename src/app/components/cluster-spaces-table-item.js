import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  Component,
} = Ember;

export default Component.extend({
  /**
   * @type {Component.OneCollapsibleListItem}
   */
  oneListItem: null,

  /**
   * @type {SpaceDetails}
   */
  space: null,

  actions: {
    revokeSpace() {
      return invokeAction(this, 'revokeSpace', this.get('space.id'));
    },
  },
});
