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

import Ember from 'ember';
import Onepanel from 'npm:onepanel';
import OnepanelServerBase from 'ember-onedata-onepanel-server/services/-onepanel-server-base';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import getTaskId from 'ember-onedata-onepanel-server/utils/get-task-id';

function replaceUrlOrigin(url, newOrigin) {
  return url.replace(/https?:\/\/.*?(\/.*)/, newOrigin + '$1');
}

const {
  RSVP: {
    Promise,
  },
  computed,
} = Ember;

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
   * Checks if cookies-based session is valid by trying to get session.
   * 
   * If the session is valid, it automatically (re)initializes the main client.
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
    return new Promise((resolve) => {
      let client = this.createClient(origin);
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
    return new Promise((resolve) => {
      let client = this.createClient();
      let api = new Onepanel.OneproviderApi(client);

      let callback = function (error) {
        if (error) {
          let statusCode = error.response.statusCode;
          if (statusCode === 406) {
            resolve('zone');
          } else {
            resolve('provider');
          }
        } else {
          resolve('provider');
        }
      };
      api.getProvider(callback);
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
            response,
          });
        }
      };
      api.createSession(callback);
    });

    return loginCall.then(() => this.validateSession());
  },

});
