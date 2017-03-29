import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  Component,
  inject: { service },
} = Ember;

// TODO MB, GB, TB - selector
const FORM_FIELDS = [
  { name: 'name', type: 'text' },
  { name: 'token', type: 'text' },
  { name: 'size', type: 'number' },
];

export default Component.extend({
  classNames: 'support-space',

  spacesManager: service(),
  storagesManager: service(),

  // TODO maybe injected in future  
  storagesProxy: null, // FIXME proxy

  init() {
    this._super(...arguments);
    if (this.get('storagesProxy') == null) {
      this.set(
        'storagesProxy',
        this.get('storagesManager').getStorages()
      );
    }
  },

  actions: {
    submit({}) {
      invokeAction(this, 'supportSpace', {

      });
    },
    storageChanged() {
      // currently do nothing
    },
  },
});
