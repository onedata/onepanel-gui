import Ember from 'ember';
import Onepanel from 'npm:onepanel';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import getTaskId from 'ember-onedata-onepanel-server/utils/get-task-id';

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

// TODO current req timeout: 1 minute, test and handle this or increase

function replaceUrlOrigin(url, newOrigin) {
  return url.replace(/https?:\/\/.*?(\/.*)/, newOrigin + '$1');
}

const {
  RSVP: {
    Promise
  },
  computed,
  computed: {
    readOnly
  }
} = Ember;

export default Ember.Service.extend({
  /**
   * An Onepanel API Client that is used for making requests.
   * 
   * @type {Onepanel.ApiClient}
   */
  client: null,

  /**
   * Internal promise of this proxy resolves when the stored session is valid.
   * 
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
  }).readOnly(),

  _onepanelApi: computed('client', function () {
    let client = this.get('client');
    return client ? new Onepanel.OnepanelApi(client) : null;
  }).readOnly(),

  _onezoneApi: computed('client', function () {
    let client = this.get('client');
    return client ? new Onepanel.OnezoneApi(client) : null;
  }).readOnly(),

  _oneproviderApi: computed('client', function () {
    let client = this.get('client');
    return client ? new Onepanel.OneproviderApi(client) : null;
  }).readOnly(),

  /**
   * Check is stored session is valid and initialize some properties.
   */
  init() {
    this._super(...arguments);
    let validatingSession = this.validateSession();
    this.set('sessionValidator', ObjectPromiseProxy.create({
      promise: validatingSession
    }));
  },

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
    return new Promise((resolve, reject) => {
      let callback = (error, data, response) => {
        let taskId = getTaskId(response);
        let task;
        if (taskId) {
          task = watchTaskStatus(this, taskId);
        }
        if (error) {
          reject(error);
        } else {
          resolve({
            data,
            response,
            task
          });
        }
      };
      this.get('_' + api + 'Api')[method](...params, callback);
    });
  },

  /**
   * Checks if cookies-based session is valid by doing test request.
   * 
   * If the session is valid it automatically initializes the main client.
   * 
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

  /**
   * Creates and returns Onepanel client instance.
   *
   * It uses cookies authenticatoin, so make sure that the cookies for current
   * domain are set (using /login method).
   *
   * @param {string} [origin]
   */
  createClient(origin = null) {
    let client = new Onepanel.ApiClient();
    client.basePath = replaceUrlOrigin(client.basePath, origin || window.location
      .origin);
    return client;
  },

  /**
   * Creates and sets main client used by this service.
   * 
   * Must be invoked before using ``request`` method!
   * 
   * @param {string} [origin]
   */
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
  },

  /**
   * Makes a request to /login endpoint to initialize session (set-cookies).
   * @param {string} username 
   * @param {string} password
   * @returns {Promise}
   */
  login(username, password) {
    return new Promise((resolve, reject) => {
      let success = function (data, textStatus, jqXHR) {
        resolve({
          data,
          textStatus,
          jqXHR
        });
      };

      let error = function (jqXHR, textStatus, errorThrown) {
        reject({
          jqXHR,
          textStatus,
          errorThrown
        });
      };

      $.ajax('/api/v3/onepanel/login', {
        method: 'POST',
        contentType: 'application/json',
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa(
            username + ":" + password));
        },
        success,
        error
      });

    });
  }

});
