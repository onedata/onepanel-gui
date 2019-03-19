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

import { computed, get } from '@ember/object';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { classify } from '@ember/string';
import OnepanelServerBase from 'ember-onedata-onepanel-server/services/-onepanel-server-base';
import getTaskId from 'ember-onedata-onepanel-server/utils/get-task-id';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import $ from 'jquery';
import Onepanel from 'npm:onepanel';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { Promise, resolve } from 'rsvp';

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

export default OnepanelServerBase.extend(
  createDataProxyMixin('apiOrigin'),
  createDataProxyMixin('standaloneOnepanelOrigin'), {
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
      return new Promise((requestResolve, requestReject) => {
          const callback = (error, data, response) => {
            let taskId = getTaskId(response);
            let task;
            if (taskId) {
              task = watchTaskStatus(this, taskId);
            }
            if (error) {
              requestReject(error);
            } else {
              requestResolve({
                data,
                response,
                task,
              });
            }
          };
          const customHandler = CUSTOM_REQUESTS[`${api}_${method}`];
          if (customHandler) {
            customHandler(...params, callback);
          } else {
            if (this.get('isInitialized')) {
              const apiObject = this.get('_' + api + 'Api');
              const methodFun = apiObject[method];
              if (methodFun) {
                let ensureTokenPromise;
                if (!this.isClientTokenUpToDate()) {
                  ensureTokenPromise = this.renewClientToken();
                } else {
                  ensureTokenPromise = resolve();
                }
                ensureTokenPromise
                  .then(() => {
                    methodFun.bind(apiObject)(...params, callback);
                  });
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
        })
        .catch(error => {
          this.handleRequestError(error);
          throw error;
        });
    },

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
     * @param {string} serviceType 
     * @param {string} clusterId 
     */
    fetchStandaloneOnepanelOrigin(serviceType, clusterId) {
      if (!serviceType || !clusterId) {
        throw new Error(
          'service:onepanel-server#fetchStandaloneOnepanelOrigin: cannot execute without all fetchArgs'
        );
      }
      const _location = this.get('_location');
      if (serviceType === 'oneprovider') {
        return new Promise((resolve, reject) =>
            $.ajax(
              '/gui-origin', {
                method: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                  clusterId: clusterId,
                  clusterType: 'oneprovider',
                }),
              }
            ).then(resolve, reject))
          .then(({ domain }) => `https://${domain}:9443`);
      } else {
        // Onezone Panel served from Onezone host is on different port
        // TODO: probably unsafe if using other port for https
        return resolve(`${_location.origin}:9443`);
      }
    },

    /**
     * @override
     * @param {object} [oneproviderTokenData] data fetched from Onezone's
     *   /gui-token for 'oneprovider' cluster - can be used to prevent from
     *   making multiple requests
     */
    fetchApiOrigin() {
      const clusterIdFromUrl = this.getClusterIdFromUrl();
      const _location = this.get('_location');
      if (clusterIdFromUrl) {
        const serviceType = this.getClusterTypeFromUrl();
        return this.getStandaloneOnepanelOriginProxy({
          fetchArgs: [
            serviceType,
            clusterIdFromUrl,
          ],
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
      const isHosted = Boolean(clusterIdFromUrl);

      /** 
       * Resolve token for authorizing Onepanel REST calls
       * @type {string}
       */
      let onepanelTokenPromise;
      if (isHosted) {
        onepanelTokenPromise = getHostedOnepanelToken(
          clusterIdFromUrl,
          clusterTypeFromUrl
        );
      } else {
        onepanelTokenPromise = getStandaloneOnepanelToken();
      }

      return onepanelTokenPromise
        .then(tokenData => {
          const onepanelToken = tokenData.token;
          const ttl = tokenData.ttl;

          return this.getApiOriginProxy()
            .then(apiOrigin => {
              return run(() => {
                return this.initClient({
                    token: onepanelToken,
                    origin: apiOrigin,
                    ttl,
                  })
                  .then(() => {
                    return this.request('onepanel', 'getCurrentUser').then(
                      ({ data }) => {
                        const username = get(data, 'username');
                        safeExec(this, 'set', 'username', username);
                        return { token: onepanelToken, username };
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
    createClient({ token, origin, ttl } = {}) {
      const location = this.get('_location');
      let client = new Onepanel.ApiClient();
      if (token) {
        setClientToken(client, token, ttl);
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
    initClient({ token, origin, ttl } = {}) {
      return new Promise((resolve) => {
        let client = this.createClient({ token, origin, ttl });
        this.set('client', client);
        resolve();
      });
    },

    destroyClient() {
      this.setProperties({
        client: null,
      });
    },

    isClientTokenUpToDate() {
      const client = this.get('client');
      if (client) {
        return get(client, 'tokenUpdateTime') + get(client, 'ttl') * 1000 >=
          Date.now() + 1000;
      } else {
        throw new Error(
          'service:onepanel-server#isClientTokenUpToDate: client not initialized'
        );
      }
    },

    renewClientToken() {
      const client = this.get('client');
      if (client) {
        const isStandalone = this.get('isStandalone');
        let tokenPromise;
        if (isStandalone) {
          tokenPromise = getStandaloneOnepanelToken();
        } else {
          tokenPromise = getHostedOnepanelToken(
            this.getClusterIdFromUrl(),
            this.getClusterTypeFromUrl()
          );
        }
        return tokenPromise
          .then(({ token, ttl }) => {
            setClientToken(client, token, ttl);
          });
      } else {
        throw new Error(
          'service:onepanel-server: No client initialized to renew the token'
        );
      }
    },

    /**
     * Makes a request to backend to create session using basic auth.
     * Only in standalone mode.
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
    } = {}) {
      return this.getApiOriginProxy().then(apiOrigin => {
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
              // TODO: hack for handling buggy swagger
              let xdata;
              if (data) {
                xdata = data;
              } else {
                xdata = response.text && JSON.parse(response.text);
              }
              resolve({
                response,
                data: xdata,
              });
            }
          };
          api[method](...callArgs, callback);
        });
      });
    },
  }
);

function setClientToken(client, token, ttl) {
  client.defaultHeaders['X-Auth-Token'] = token;
  client.tokenUpdateTime = Date.now();
  if (ttl != null) {
    client.ttl = ttl;
  }
}

function getHostedOnepanelToken(clusterId, clusterType) {
  return new Promise((resolve, reject) => $.ajax(
    '/gui-token', {
      method: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify({
        clusterId: clusterId,
        clusterType: clusterType,
      }),
    }
  ).then(resolve, reject));
}

function getStandaloneOnepanelToken() {
  return new Promise((resolve, reject) => $.ajax(
    '/gui-token', {
      method: 'POST',
    }
  ).then(resolve, reject));
}
