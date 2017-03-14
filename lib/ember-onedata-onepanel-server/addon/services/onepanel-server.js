import Ember from 'ember';

import Onepanel from 'npm:onepanel';

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

// TODO current req timeout: 1 minute, test and handle this or increase

function replaceUrlOrigin(url, newOrigin) {
  return url.replace(/https?:\/\/.*?(\/.*)/, newOrigin + '$1');
}

const {
  RSVP: {
    Promise
  },
  inject: {
    service
  },
  computed,
  computed: {
    readOnly
  }
} = Ember;

export default Ember.Service.extend({
  cookies: service(),

  /**
   * @type {Onepanel.OnepanelApi}
   */
  client: null,

  /**
   * @type {ObjectPromiseProxy}
   */
  sessionValidator: null,

  username: null,
  password: null,

  isLoading: readOnly('sessionValidator.isPending'),

  /**
   * @type {computed<Boolean>}
   */
  isInitialized: computed('client', function () {
    return this.get('client') != null;
  }),

  /// APIs provided by onepanel client library

  /**
   * Make an API call using onepanel library (onepanel-javascript-client).
   *
   * It's like creating API object of onepanel library and invoking its method
   * with parameters. Eg. ``new Onepanel.SomeApi().someMethod(...params)``
   *
   * @param {string} api name of API: onepanel, oneprovider, onezone
   * @param {string} method name of method of onepanel library
   * @param {...string} params parameters for onepanel method
   *
   * @returns {Promise} resolve({data: any, response: object});
   *                    reject(error: string)
   */
  request(api, method, ...params) {
    // TODO protect property read
    return new Promise((resolve, reject) => {
      let callback = (error, data, response) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            data,
            response
          });
        }
      };
      this.get(api + 'Api')[method](...params, callback);
    });
  },

  // TODO FIXME DO NOT USE THESE!!! use request method instead

  onepanelApi: computed('client', function () {
    let client = this.get('client');
    return client ? new Onepanel.OnepanelApi(client) : null;
  }).readOnly(),

  onezoneApi: computed('client', function () {
    let client = this.get('client');
    return client ? new Onepanel.OnezoneApi(client) : null;
  }).readOnly(),

  oneproviderApi: computed('client', function () {
    let client = this.get('client');
    return client ? new Onepanel.OneproviderApi(client) : null;
  }).readOnly(),

  init() {
    this._super(...arguments);
    let validatingSession = this.validateSession();
    this.set('sessionValidator', ObjectPromiseProxy.create({
      promise: validatingSession
    }));
  },

  /**
   * @returns {Promise}
   */
  validateSession() {
    return new Promise((resolve, reject) => {
      let testingAuth = this.requestTestAuth();
      testingAuth.then(() => {
        this.initClient();
        resolve();
      });
      testingAuth.catch(reject);
    });
  },

  createClient(origin = null) {
    let client = new Onepanel.ApiClient();
    client.basePath = replaceUrlOrigin(client.basePath, origin || window.location.origin);
    return client;
  },

  initClient(origin = null) {
    let client = this.createClient(origin);
    this.set('client', client);
  },

  /**
   * Makes a request that will resolve if provided username, password and
   * origin are valid.
   * 
   * @param {string} username 
   * @param {string} password 
   * @param {string} [origin] 
   * @returns {Promise}
   */
  requestTestAuth() {
    let client = this.createClient();
    let api = new Onepanel.OnepanelApi(client);
    // invoke any operation that requires authentication
    return new Promise((resolve, reject) => {
      let callback = function (error, data, response) {
        if (error) {
          reject(error);
        } else {
          resolve({
            response
          });
        }
      };
      api.getClusterCookie(callback);
    });
  }

});
