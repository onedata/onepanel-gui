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

import { Promise, resolve } from 'rsvp';

import { run } from '@ember/runloop';
import { computed } from '@ember/object';
import Onepanel from 'npm:onepanel';
import OnepanelServerBase from 'ember-onedata-onepanel-server/services/-onepanel-server-base';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import getTaskId from 'ember-onedata-onepanel-server/utils/get-task-id';
import { classify } from '@ember/string';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

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

const reOnepanelInOnzoneUrl = /.*\/(opp|ozp)\/(.*?)\/(.*)/;

export default OnepanelServerBase.extend(
  createDataProxyMixin('serviceType'),
  createDataProxyMixin('node'),
  createDataProxyMixin('apiOrigin'), {
    /**
     * An Onepanel API Client that is used for making requests.
     * 
     * @type {Onepanel.ApiClient}
     */
    client: null,

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
      this.updateServiceTypeProxy();
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
     * @override
     */
    fetchNode() {
      return this.staticRequest('onepanel', 'getNode')
        .then(({ data: { hostname, componentType } }) => ({
          hostname,
          componentType,
        }));
    },

    getLocation() {
      return location;
    },

    getClusterIdFromUrl() {
      const m = this.getLocation().toString().match(reOnepanelInOnzoneUrl);
      return m && m[2];
    },

    // FIXME: move to cluster manager? - it needs refactoring
    getClusterId() {
      const idFromLocation = this.getClusterIdFromUrl();
      if (idFromLocation) {
        return resolve(idFromLocation);
      } else {
        return this.request('onepanel', 'getCurrentCluster')
          .then(({ data }) => data.id);
      }
    },

    /**
     * @override
     */
    fetchApiOrigin(onezoneToken) {
      const clusterIdFromUrl = this.getClusterIdFromUrl();
      const _location = this.getLocation();
      if (clusterIdFromUrl) {
        return this.getServiceTypeProxy().then(serviceType => {
          if (serviceType === 'provider') {
            // frontend is served from Onezone host - use external host
            return new Promise((resolve, reject) => {
                $.ajax(
                  '/api/v3/onezone/clusters/' + clusterIdFromUrl, {
                    headers: {
                      'X-Auth-Token': onezoneToken,
                    },
                  }
                ).then(resolve, reject);
              })
              .then(({ domain }) => `https://${domain}:9443`);
          } else {
            // Onezone Panel served from Onezone host is on different port
            // TODO: probably unsafe if using other port for https
            return resolve(`${_location.origin}:9443`);
          }
        });
      } else {
        // frontend is served from Onepanel host
        return resolve(_location.origin);
      }
    },

    /**
     * Checks if cookies-based session is valid by trying to get REST token.
     * 
     * If the session is valid, it automatically (re)initializes the main client.
     * 
     * @returns {Promise} an `initClient` promise if `getSession` succeeds
     */
    validateSession() {
      return $.get('/rest-credentials')
        .then(tokenData => {
          // FIXME: this name cannot be used in production version - backend
          const token = tokenData.token || tokenData.allButOnezoneToken;
          const onezoneToken = tokenData.onezoneToken;
          // FIXME: need to set?
          safeExec(this, 'set', 'onezoneToken', onezoneToken);
          return this.getApiOriginProxy({ fetchArgs: [onezoneToken] }).then(origin => ({
            origin,
            token,
          }));
        })
        .then(({ origin, token }) => {
          return run(() => {
            // FIXME: username will not work - use getCurrentUser
            this.set('username', 'hello_world');
            return this.initClient({ token, origin })
              .then(() => ({ token, username: 'hello_world' }));
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
      const location = this.getLocation();
      let client = new Onepanel.ApiClient();
      if (token) {
        client.defaultHeaders['X-Auth-Token'] = token;
      }
      client.basePath = replaceUrlOrigin(client.basePath, origin || location.origin);
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

    /**
     * @override
     */
    fetchServiceType() {
      const location = this.getLocation();
      const m = location.toString().match(reOnepanelInOnzoneUrl);
      if (m) {
        return resolve(m[1] === 'ozp' ? 'zone' : 'provider');
      } else {
        return this.getNodeProxy().then(({ componentType }) =>
          componentType.match(/one(.*)/)[1]
        );
      }
    },

    /**
     * Get hostname of this panel
     * @returns {Promise<string>}
     */
    getHostname() {
      return this.getNodeProxy()
        .then(({ hostname }) => hostname);
    },

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

    staticRequest(apiName, method, callArgs = [], {
      username,
      password,
      token,
      onezoneToken,
    } = {}) {
      return this.getApiOriginProxy({ fetchArgs: [onezoneToken] }).then(apiOrigin => {
        const client = this.createClient({ origin: apiOrigin, token });
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
      });
    },

  });
