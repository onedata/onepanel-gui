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
  },
} = Ember;

/**
 * Contains alternative implementation of onepanel client methods
 *
 * Each method should have the same signature as a onepanel client method.
 * The ``callback`` that is passed as a last parameter should take:
 * ``error, data, response``.
 */
const CUSTOM_REQUESTS = {};

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

  serviceType: null,

  /**
   * A user username that is set after successful login
   * @type {string}
   */
  username: null,

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
      let customHandler = CUSTOM_REQUESTS[`${api}_${method}`];
      if (customHandler) {
        customHandler(...params, callback);
      } else {
        this.get('_' + api + 'Api')[method](...params, callback);
      }
    });
  },

  /**
   * Checks if cookies-based session is valid by trying to get session.
   * 
   * If the session is valid, it automatically initializes the main client.
   * 
   * @returns {Promise} an ``initClient`` promise if ``getSession`` succeeds
   */
  validateSession() {
    return new Promise((resolve, reject) => {
      let testingAuth = this.getSession();
      testingAuth
        .then(({ data: { username } }) => {
          this.set('username', username);
          return this.initClient();
        })
        .then(resolve, reject);
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
    client.basePath = replaceUrlOrigin(client.basePath, origin || window.location.origin);
    return client;
  },

  /**
   * Creates and sets main client used by this service.
   * 
   * Must be invoked before using ``request`` method!
   * 
   * @param {string} [origin]
   * @returns {Promise} resolves with { serviceType: string }
   */
  initClient(origin = null) {
    return new Promise((resolve, reject) => {
      let client = this.createClient(origin);
      this.set('client', client);
      let gettingType = this.getServiceType();
      gettingType.then(serviceType => {
        this.set('serviceType', serviceType);
        resolve({ serviceType });
      });
      gettingType.catch(reject);
    });
  },

  /**
   * Make request that checks if the GUI is backed by provider or zone
   * @returns {Promise} resolves with 'provider' or 'zone'; rejects on error
   */
  getServiceType() {
    return new Promise((resolve, reject) => {
      let gettingProvider = this.request('oneprovider', 'getProvider');
      gettingProvider.then(() => resolve('provider'));
      gettingProvider.catch(error => {
        let statusCode = error.response.statusCode;
        if (statusCode === 404) {
          resolve('provider');
        } else if (statusCode === 406) {
          // TODO maybe try to make request to Zone to be sure...
          resolve('zone');
        } else {
          reject(error);
        }
      });
    });
  },

  /**
   * Tries to get a session to check if session stored in cookies are valid
   *
   * This method should work both on provider and zone service types in both
   * unauthenticated or authenticated mode.
   * 
   * @returns {Promise} resolves with { data: { username: string } }
   */
  getSession() {
    let client = this.createClient();
    let api = new Onepanel.OnepanelApi(client);

    return new Promise((resolve, reject) => {
      let callback = function (error, data, response) {
        if (error) {
          reject(error);
        } else {
          resolve({
            data,
            response,
          });
        }
      };
      api.getSession(callback);
    });
  },

  /**
   * Makes a request to backend to create session using basic auth.
   *
   * @param {string} username 
   * @param {string} password
   * @returns {Promise}
   */
  login(username, password) {
    let client = this.createClient();
    client.defaultHeaders['Authorization'] =
      'Basic ' + btoa(username + ":" + password);
    let api = new Onepanel.OnepanelApi(client);

    let loginCall = new Promise((resolve, reject) => {
      let callback = function (error, data, response) {
        if (error) {
          reject(error);
        } else {
          resolve({
            response
          });
        }
      };
      api.createSession(callback);
    });

    // TODO use a session Ember addon for storing this
    loginCall.then(() => {
      return this.validateSession();
    });

    return loginCall;
  }

});