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
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get } from '@ember/object';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import OnepanelServerBase from 'ember-onedata-onepanel-server/services/-onepanel-server-base';
import getTaskId from 'ember-onedata-onepanel-server/utils/get-task-id';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import $ from 'jquery';
import Onepanel from 'onepanel';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { Promise, resolve } from 'rsvp';

function replaceUrlOrigin(url, newOrigin) {
  return url.replace(/(https?:\/\/).*?(\/.*)/, `$1${newOrigin}$2`);
}

/**
 * Contains alternative implementation of onepanel client methods
 *
 * Each method should have the same signature as a onepanel client method.
 * The `callback` that is passed as a last parameter should take:
 * `error, data, response`.
 */
const CUSTOM_REQUESTS = {};

export default OnepanelServerBase.extend(
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
     * We cannot store `api` objects if client changes - they must be re-generated.
     */
    apiCache: computed('client', () => ({})),

    /**
     * @type {computed<Boolean>}
     */
    isInitialized: computed('client', function () {
      return this.get('client') != null;
    }).readOnly(),

    getApi(apiName) {
      const apiCache = this.get('apiCache');
      const client = this.get('client');
      if (!client) {
        return null;
      }
      let api = apiCache[apiName];
      if (!api) {
        if (typeof Onepanel[apiName] !== 'function') {
          throw new Error(
            `onepanel-sever#getApi: API "${apiName}" not found in JS client - probably a wrong version of onepanel JS library is used`
          );
        }
        api = apiCache[apiName] = new Onepanel[apiName](client);
      }
      return api;
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
      return new Promise((requestResolve, requestReject) => {
          const callback = (error, data, response) => {
            const taskId = getTaskId(response);
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
              const apiObject = this.getApi(api);
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
        .catch(async error => {
          await this.handleRequestError(error);
          throw error;
        });
    },

    /**
     * @override
     */
    fetchApiOrigin() {
      return this.getGuiContextProxy().then(({ apiOrigin }) => apiOrigin);
    },

    /**
     * Checks if cookies-based session is valid by trying to get REST token.
     *
     * If the session is valid, it automatically (re)initializes the main client.
     *
     * Token fetching:
     * - if emergency, then just POST /gui-token without payload
     * - if hosted, then POST /gui-token with type and clusterId (both from URL)
     *
     * @returns {Promise<object>} an `initClient` promise if `getSession` succeeds,
     *    resolves object with: token (for Onepanel API), username
     */
    validateSession() {
      return this.getOnepanelToken()
        .then(tokenData => {
          const onepanelToken = tokenData.token;
          const ttl = tokenData.ttl;

          return this.getApiOriginProxy()
            .then(apiOrigin => {
              return run(() => {
                return this.initClient({
                    token: onepanelToken,
                    apiOrigin,
                    ttl,
                  })
                  .then(() => {
                    return this.getCurrentUser()
                      .then(userDetails => {
                        const username = get(userDetails, 'username');
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
     * It uses cookies authentication, so make sure that the cookies for current
     * domain are set (using /login method).
     *
     * @param {string} [token]
     * @param {string} [apiOrigin]
     * @param {number} [ttl]
     * @returns {Onepanel.ApiClient}
     */
    createClient({ token, apiOrigin, ttl } = {}) {
      const location = this.get('_location');
      const client = new Onepanel.ApiClient();
      if (token) {
        setClientToken(client, token, ttl);
      }
      client.basePath = replaceUrlOrigin(
        client.basePath,
        apiOrigin || location.host
      );
      return client;
    },

    /**
     * Creates and sets main client used by this service.
     *
     * Must be invoked before using `request` method!
     *
     * @param {string} [token]
     * @param {string} [apiOrigin]
     * @returns {Promise}
     */
    initClient({ token, apiOrigin, ttl } = {}) {
      return new Promise((resolve) => {
        const client = this.createClient({ token, apiOrigin, ttl });
        this.set('client', client);
        resolve();
      });
    },

    destroyClient() {
      this.set('client', null);
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
        return this.getOnepanelToken()
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
     * Only in emergency mode.
     *
     * @param {string} password
     * @returns {Promise}
     */
    login(password) {
      return new Promise((resolve, reject) => {
        $.ajax('/login', {
          method: 'POST',
          headers: { Authorization: 'Basic ' + btoa(password) },
        }).then(resolve, reject);
      }).then(() => this.validateSession());
    },

    staticRequest(apiName, method, callArgs = [], {
      password,
      token,
    } = {}) {
      return this.getApiOriginProxy().then(apiOrigin => {
        const client = this.createClient({ apiOrigin, token });
        if (password) {
          client.defaultHeaders['Authorization'] =
            'Basic ' + btoa(password);
        }
        const ApiConstructor = Onepanel[apiName];
        const api = new ApiConstructor(client);

        return new Promise((resolve, reject) => {
          const callback = function (error, data, response) {
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

    /**
     * Resolves to token for authorizing Onepanel REST calls
     * @returns {Promise<object>} object properties: token, ttl
     */
    getOnepanelToken() {
      return resolve($.post('./gui-preauthorize'));
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
