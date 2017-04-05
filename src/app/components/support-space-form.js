import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  Component,
  inject: { service },
  computed,
  ObjectProxy,
  PromiseProxyMixin,
  RSVP: { Promise },
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

const FORM_FIELDS = [
  { name: 'token', type: 'text' },
  // the size field is inserted manually because of MB/GB/TB radio buttons
];

const MEGA = Math.pow(10, 6);
const GIGA = Math.pow(10, 9);
const TERA = Math.pow(10, 12);

const UNITS = {
  mb: MEGA,
  gb: GIGA,
  tb: TERA,
};

export default Component.extend({
  classNames: 'support-space-form',

  i18n: service(),
  storageManager: service(),

  formFields: computed(() => FORM_FIELDS).readOnly(),

  /**
   * @type ObjectPromiseProxy.Array.StorageDetails
   */
  allStoragesProxy: null,

  _selectedStorage: null,
  formValues: Ember.Object.create({
    token: '',
    size: '',
    sizeUnit: 'mb',
  }),

  // TODO change to ember-cp-validations  
  canSubmit: computed('_selectedStorage', function () {
    let {
      _selectedStorage
    } = this.getProperties('_selectedStorage');
    return _selectedStorage != null;
  }),

  init() {
    this._super(...arguments);
    if (this.get('allStoragesProxy') == null) {
      this._initStoragesProxy();
    }
    let i18n = this.get('i18n');
    FORM_FIELDS.forEach(f => {
      if (!f.placeholder) {
        f.placeholder = i18n.t(`components.supportSpaceForm.fields.${f.name}`);
      }
    });
  },

  _initStoragesProxy() {
    let allStoragesPromise = new Promise((resolve, reject) => {
      let storagesPromise = this.get('storageManager').getStorages()
        .get('promise');
      storagesPromise.then(storages => {
        Promise.all(storages).then(resolve, reject);
      });
      storagesPromise.catch(reject);
    });

    this.set(
      'allStoragesProxy',
      ObjectPromiseProxy.create({ promise: allStoragesPromise })
    );
  },

  actions: {
    submit() {
      let {
        token,
        size,
        sizeUnit,
      } = this.get('formValues').getProperties('name', 'token', 'size', 'sizeUnit');

      size = size * UNITS[sizeUnit];

      let storageId = this.get('_selectedStorage.id');

      return invokeAction(this, 'submitSupportSpace', {
        token,
        size,
        storageId,
      });
    },
    // TODO input changed should be some generic mixin method
    inputChanged(field, value) {
      this.get('formValues').set(field, value);
    },
    storageChanged(storage) {
      this.set('_selectedStorage', storage);
    },
  },
});
