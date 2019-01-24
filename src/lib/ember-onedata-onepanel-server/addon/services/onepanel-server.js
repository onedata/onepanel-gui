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
import { computed, get } from '@ember/object';
import Onepanel from 'npm:onepanel';
import OnepanelServerBase from 'ember-onedata-onepanel-server/services/-onepanel-server-base';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import getTaskId from 'ember-onedata-onepanel-server/utils/get-task-id';
import { classify } from '@ember/string';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import $ from 'jquery';
import { inject as service } from '@ember/service';

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
  createDataProxyMixin('node'),
  createDataProxyMixin('apiOrigin'), {
    guiUtils: service(),

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
     * @type {Window.Location}
     */
    _location: location,

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
          if (this.get('isInitialized')) {
            const apiObject = this.get('_' + api + 'Api');
            const methodFun = apiObject[method];
            if (methodFun) {
              methodFun.bind(apiObject)(...params, callback);
            } else {
              throw new Error(
                `No such method in API client: ${api} ${method}, maybe the oneclient package is incompatible?`
              );
            }
          } else {
            throw new Error(
              'API client not inialized, maybe there was request before authentication'
            );
          }

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

    getClusterTypeFromUrl() {
      const m = this.getLocation().toString().match(reOnepanelInOnzoneUrl);
      return m && (m[1] === 'ozp' ? 'onezone' : 'oneprovider');
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
        const serviceType = this.getClusterTypeFromUrl();
        if (serviceType === 'oneprovider') {
          if (!onezoneToken) {
            throw new Error(
              'service:onepanel-server: Hosted op-panel needs Onezone token to resolve API origin'
            );
          }
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
            .then(({ serviceId }) => $.ajax(
              '/api/v3/onezone/providers/' + serviceId, {
                headers: {
                  'X-Auth-Token': onezoneToken,
                },
              }
            ))
            .then(({ domain }) => `https://${domain}:9443`);
        } else {
          // Onezone Panel served from Onezone host is on different port
          // TODO: probably unsafe if using other port for https
          return resolve(`${_location.origin}:9443`);
        }
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
     * Token fetching:
     * - if standalone, then just POST /gui-token without payload
     * - if hosted, then POST /gui-token with type and clusterId (both from URL)
     * 
     * @returns {Promise<object>} an `initClient` promise if `getSession` succeeds,
     *    resolves object with: token (for Onepanel API), username
     */
    validateSession() {
      const clusterIdFromUrl = this.getClusterIdFromUrl();
      const clusterTypeFromUrl = this.getClusterTypeFromUrl();

      /**
       * True if the Onepanel is hosted by Onezone, so we will use 
       * @type {boolean}
       */
      const isHosted = !!clusterIdFromUrl;

      /** 
       * Resolve token for authorizing Onepanel REST calls
       * @type {string}
       */
      let onepanelTokenPromise;
      if (isHosted) {
        onepanelTokenPromise = new Promise((resolve, reject) => $.ajax(
          '/gui-token', {
            method: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
              clusterId: clusterIdFromUrl,
              clusterType: clusterTypeFromUrl,
            }),
          }
        ).then(resolve, reject));
      } else {
        // FIXME: this will be POST in future
        onepanelTokenPromise = new Promise((resolve, reject) => $.ajax(
          '/gui-token', {
            method: 'GET',
          }
        ).then(resolve, reject));
      }

      // FIXME: use ttl and get new token, so move above to other fun

      return onepanelTokenPromise
        .then(tokenData => {
          const onepanelToken = tokenData.token;
          const username = tokenData.username;

          let onezoneTokenPromise;
          if (isHosted && clusterTypeFromUrl === 'oneprovider') {
            // additional fetch of onezone token for hosted op-panel
            onezoneTokenPromise = new Promise((resolve, reject) => $.ajax(
                '/gui-token', {
                  method: 'POST',
                  contentType: 'application/json; charset=utf-8',
                  dataType: 'json',
                  data: JSON.stringify({
                    clusterId: 'onezone',
                    clusterType: 'onezone',
                  }),
                }
              ).then(resolve, reject))
              .then(({ token }) => token);
          } else {
            // on hosted oz-panel, the Onezone token is the same as Onepanel token
            onezoneTokenPromise = resolve(onepanelToken);
          }

          return onezoneTokenPromise.then(onezoneToken => {
            safeExec(this, 'set', 'onezoneToken', onezoneToken);
            return this.getApiOriginProxy({ fetchArgs: [onezoneToken] })
              .then(apiOrigin => {
                return run(() => {
                  return this.initClient({ token: onepanelToken, origin: apiOrigin })
                    .then(() => {
                      // the username is available when using token from Onepanel endpoint
                      // otherwise we must request it
                      if (username) {
                        safeExec(this, 'set', 'username', username);
                        return { token: onepanelToken, username };
                      } else {
                        return this.request('onepanel', 'getCurrentUser').then(
                          ({ data }) => {
                            const username = get(data, 'username');
                            safeExec(this, 'set', 'username', username);
                            return { token: onepanelToken, username };
                          });
                      }
                    });
                });
              });
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
     * @returns {Promise}
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

    /**
     * @override
     * Fetches configuration
     * @returns {Promise<Object>}
     */
    fetchConfiguration() {
      return this.getApiOriginProxy().then(apiOrigin => {
        return new Promise((resolve, reject) => {
          $.ajax(`${apiOrigin}/configuration`).then(resolve, reject);
        });
      });
    },
  }
);
