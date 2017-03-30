import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  Component
} = Ember;

export default Component.extend({
  /**
   * @type {ObjectPromiseProxy.SpaceDetails}
   */
  spaces: null,

  actions: {
    revokeSpace(spaceId) {
      return invokeAction(this, 'revokeSpace', spaceId);
    },
  },
});
