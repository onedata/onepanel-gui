import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  Component,
  inject: { service },
  computed: { readOnly },
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
  formFields: readOnly(() => FORM_FIELDS),

  selectedStorageId: null,

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
    // FIXME unfinished
    submit({ name, storageId }) {
      invokeAction(this, 'supportSpace', {
        name,
        storageId
      });
    },
    storageChanged() {
      // currently do nothing
    },
  },
});
