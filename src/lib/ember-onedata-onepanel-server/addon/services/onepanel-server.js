/**
 * Ember-level interface for using onepanel API 
 *
 * It uses internally onepanel javascript client library.
 * API methods should be invoked by using ``request`` method.
 * The service wraps onepanel async requests into promises with additional
 * fields (see ``request`` method).
 * 
 * @module services/onepanel-server
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';

import { run } from '@ember/runloop';
import { computed } from '@ember/object';
import Onepanel from 'npm:onepanel';
import OnepanelServerBase from 'ember-onedata-onepanel-server/services/-onepanel-server-base';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import getTaskId from 'ember-onedata-onepanel-server/utils/get-task-id';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { classify } from '@ember/string';

function replaceUrlOrigin(url, newOrigin) {
  return url.replace(/https?:\/\/.*?(\/.*)/, newOrigin + '$1');
}

/**
 * Contains alternative implementation of onepanel client methods
 *
 * Each method should have the same signature as a onepanel client method.
 * The ``callback`` that is passed as a last parameter should take:
 * ``error, data, response``.
 */
const CUSTOM_REQUESTS = {};

export default OnepanelServerBase.extend({
  /**
   * An Onepanel API Client that is used for making requests.
   * 
   * @type {Onepanel.ApiClient}
   */
  client: null,

  serviceType: null,

  /**
   * A user username that is set after successful login
   * @type {string}
   */
  username: null,

  /**
   * @type {computed<Boolean>}
   */
  isInitialized: computed('client', function () {
    return this.get('client') != null;
  }).readOnly(),

  /**
   * hostname - hostname of this host known by panel
   * componentType - one of: oneprovider, onezone
   * @type {Ember.ComputedProperty<PromiseObject<{hostname, componentType}>>}
   */
  nodeProxy: computed(function () {
    return PromiseObject.create({
      promise: this.staticRequest('onepanel', 'getNode')
        .then(({ data: { hostname, componentType } }) => ({
          hostname,
          componentType,
        })),
    });
  }),

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

  init() {
    this._super(...arguments);
    this.fetchAndSetServiceType();
  },

  /**
   * Make an API call using onepanel library (onepanel-javascript-client).
   *
   * It's like creating API object of onepanel library and invoking its method
   * with parameters. Eg. `new Onepanel.SomeApi().someMethod(...params)`
   *
   * @param {string} api name of API: onepanel, oneprovider, onezone
   * @param {string} method name of method of onepanel library
   * @param {...string} params parameters for onepanel method
   *
   * @returns {Promise} resolve({data: any, response: object});
   *                    reject(error: string)
   */
  request(api, method, ...params) {
    let promise = new Promise((resolve, reject) => {
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
            task,
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

    promise.catch(error => this.handleRequestError(error));

    return promise;
  },

  /**
   * Checks if cookies-based session is valid by trying to get REST token.
   * 
   * If the session is valid, it automatically (re)initializes the main client.
   * 
   * @returns {Promise} an `initClient` promise if `getSession` succeeds
   */
  validateSession() {
    return $.ajax('/rest-credentials', {
      method: 'GET',
    }).then(({ token, username }) => {
      return run(() => {
        this.set('username', username);
        return this.initClient({ token })
          .then(() => ({ token, username }));
      });
    });
  },

  /**
   * Creates and returns Onepanel client instance.
   *
   * It uses cookies authenticatoin, so make sure that the cookies for current
   * domain are set (using /login method).
   *
   * @param {string} [origin]
   * @returns {Onepanel.ApiClient}
   */
  createClient({ token, origin } = {}) {
    let client = new Onepanel.ApiClient();
    if (token) {
      client.defaultHeaders['X-Auth-Token'] = token;
    }
    client.basePath = replaceUrlOrigin(client.basePath, origin || window.location.origin);
    return client;
  },

  /**
   * Creates and sets main client used by this service.
   * 
   * Must be invoked before using `request` method!
   * 
   * @param {string} [token]
   * @param {string} [origin]
   * @returns {Promise} resolves with { serviceType: string }
   */
  initClient({ token, origin } = {}) {
    return new Promise((resolve) => {
      let client = this.createClient({ token, origin });
      this.set('client', client);
      resolve();
    });
  },

  destroyClient() {
    this.setProperties({
      client: null,
    });
  },

  fetchAndSetServiceType() {
    return new Promise((resolve, reject) => {
      let currentServiceType = this.get('serviceType');
      if (currentServiceType) {
        resolve(currentServiceType);
      } else {
        let promise = this.getServiceType();
        promise.then(serviceType => {
          this.set('serviceType', serviceType);
          resolve(serviceType);
        });
        promise.catch(reject);
      }
    });
  },

  /**
   * Make request that checks if the GUI is backed by provider or zone
   *
   * @returns {Promise} resolves with 'provider' or 'zone'; rejects on error
   */
  getServiceType() {
    return this.get('nodeProxy').then(({ componentType }) =>
      componentType.match(/one(.*)/)[1]
    );
  },

  /**
   * Get hostname of this panel
   * @returns {Promise<string>}
   */
  getHostname() {
    return this.get('nodeProxy')
      .then(({ hostname }) => hostname);
  },

  // FIXME: refactor to use static request common method or callbacl
  /**
   * @returns {string}
   */
  getOnezoneLogin() {
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
      api.getOnezoneLogin(callback);
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
    return new Promise((resolve, reject) => {
      $.ajax('/login', {
        method: 'POST',
        headers: { Authorization: 'Basic ' + btoa(username + ':' + password) },
      }).then(resolve, reject);
    }).then(() => this.validateSession());
  },

  staticRequest(apiName, method, callArgs = [], username, password) {
    const client = this.createClient();
    if (username && password) {
      client.defaultHeaders['Authorization'] =
        'Basic ' + btoa(username + ':' + password);
    }
    const ApiConstructor = Onepanel[classify(`${apiName}-api`)];
    const api = new ApiConstructor(client);

    return new Promise((resolve, reject) => {
      let callback = function (error, data, response) {
        if (error) {
          reject(error);
        } else {
          resolve({
            response,
            data,
          });
        }
      };
      api[method](...callArgs, callback);
    });
  },

});
