/**
 * Mock for REST backend of onepanel
 *
 * See ``REQ_HANDLER`` in this file to manipulate responses
 *
 * @module services/onepanel-server-mock
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import getTaskId from 'ember-onedata-onepanel-server/utils/get-task-id';
import DeploymentProgressMock from 'ember-onedata-onepanel-server/models/deployment-progress-mock';
import Plainable from 'ember-plainable/mixins/plainable';
import RequestErrorHandler from 'ember-onedata-onepanel-server/mixins/request-error-handler';
import SpaceSyncStatsMock from 'ember-onedata-onepanel-server/mixins/space-sync-stats-mock';
import _object from 'lodash/object';
import _find from 'lodash/find';

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

const {
  A,
  RSVP: {
    Promise
  },
  computed,
  computed: {
    readOnly,
  },
  inject: {
    service
  }
} = Ember;

const MOCK_USERNAME = 'mock_admin';

const PlainableObject = Ember.Object.extend(Plainable);

export default Ember.Service.extend(RequestErrorHandler, SpaceSyncStatsMock, {
  cookies: service(),

  isLoading: readOnly('sessionValidator.isPending'),

  sessionValidator: computed(function () {
    let promise = this.validateSession();
    return ObjectPromiseProxy.create({ promise });
  }).readOnly(),

  username: MOCK_USERNAME,

  mockInitializedCluster: true,

  /**
   * @type {computed<Boolean>}
   */
  isInitialized: false,

  /**
   * A onepanel typ: "provider" or "zone"
   * @type {computed.string}
   */
  serviceType: 'provider',

  /**
   * @returns {Promise}
   */
  initClient() {
    return new Promise(resolve => {
      this.set('isInitialized', true);
      resolve();
    });
  },

  destroyClient() {
    this.setProperties({
      isInitialized: false,
    });
  },

  /// APIs provided by onepanel client library

  /**
   * Mocks an onepanel API call.
   *
   * @param {string} api name of API: onepanel, oneprovider, onezone
   * @param {string} method name of method of onepanel library
   * @param {...string} params parameters for onepanel method
   *
   * @returns {Promise} resolve({data: any, response: object});
   *                    reject(error: string)
   */
  request(api, method, ...params) {
    let cookies = this.get('cookies');

    // TODO protect property read
    let promise = new Promise((resolve, reject) => {
      console.debug(
        `service:onepanel-server-mock: request API ${api}, method ${method}, params: ${JSON.stringify(params)}`
      );

      if (!cookies.read('fakeLoginFlag')) {
        reject({
          response: {
            statusCode: 401,
            body: {
              error: 'Unauthorized',
              description: 'User not authorized',
            }
          }
        });
      }

      let handler = this.get(`_req_${api}_${method}`);
      if (handler) {
        if (handler.success) {
          let response = {
            statusCode: handler.statusCode &&
              handler.statusCode(...params) || 200,
            headers: {
              location: handler.taskId ? ('https://something/tasks/' +
                handler.taskId) : undefined
            }
          };
          let taskId = getTaskId(response);
          resolve({
            data: handler.success(...params),
            response: response,
            task: taskId && this.watchTaskStatus(taskId)
          });
        } else {
          let response = {
            statusCode: handler.statusCode && handler.statusCode(...params),
          };
          reject({ response });
        }

      } else {
        reject(
          `onepanel-server-mock: mock has no method for: ${api}_${method}`
        );
      }

      resolve();
    });

    promise.catch(error => this.handleRequestError(error));

    return promise;
  },

  getServiceType() {
    let serviceType = this.get('serviceType');
    return new Promise(resolve => resolve(serviceType));
  },

  watchTaskStatus(taskId) {
    return watchTaskStatus(this, taskId);
  },

  validateSession() {
    console.debug('service:onepanel-server-mock: validateSession');
    let cookies = this.get('cookies');
    let fakeLoginFlag = cookies.read('fakeLoginFlag');
    let validating = new Promise((resolve, reject) => {
      if (fakeLoginFlag) {
        resolve();
      } else {
        reject();
      }
    });
    return validating.then(() => this.initClient());
  },

  login(username, password) {
    console.debug(`service:onepanel-server-mock: login ${username}`);
    let cookies = this.get('cookies');
    let loginCall = new Promise((resolve, reject) => {
      if (username === 'admin' && password === 'password') {
        cookies.write('fakeLoginFlag', true);
        resolve();
      } else {
        reject();
      }
    });
    return loginCall.then(() => this.validateSession());
  },

  init() {
    this._super(...arguments);
    if (this.get('mockInitializedCluster')) {
      let storage1 = {
        id: 'storage1_verylongid',
        type: 'posix',
        name: 'Some storage',
        mountPoint: '/mnt/st1',
      };
      this.get('__storages').push(storage1);
      let spaces = this.get('__spaces');
      spaces.push({
        id: 'space1_verylongid',
        name: 'Space One',
        storageId: storage1.id,
        storageImport: {
          strategy: 'no_import',
        },
        storageUpdate: {
          strategy: 'no_update',
        },
      });
      spaces.push({
        id: 'space2__verylongid',
        name: 'Space Two',
        storageId: storage1.id,
        storageImport: {
          strategy: 'simple_scan',
          maxDepth: 4,
        },
        storageUpdate: {
          strategy: 'simple_scan',
          maxDepth: 3,
          scanInterval: 1000,
          writeOnce: false,
          deleteEnable: false,
        },
      });
    }
  },

  progressMock: computed('serviceType', function () {
    let serviceType = this.get('serviceType');
    return DeploymentProgressMock.create({ onepanelServiceType: serviceType });
  }),

  /// mocked request handlers - override to change server behaviour

  _req_onepanel_getClusterHosts: computed(function () {
    return {
      success({ discovered }) {
        if (discovered) {
          return ['node1.example.com', 'node2.example.com'];
        } else {
          return ['node1.example.com'];
        }
      },
    };
  }),

  _req_onepanel_getClusterCookie: computed(function () {
    return {
      success() {
        return 'some_cluster_cookie';
      },
    };
  }),

  _req_onepanel_getTaskStatus: computed('progressMock', function () {
    let progressMock = this.get('progressMock');
    return {
      success(taskId) {
        if (taskId === 'configure') {
          return progressMock.getTaskStatusConfiguration();
        } else {
          return null;
        }
      }
    };
  }),

  // currently mocked - waiting for real logout method
  _req_onepanel_removeSession: computed(function () {
    return {
      success() {
        document.cookie = 'fakeLoginFlag=false; Max-Age=0';
        return null;
      }
    };
  }),

  _req_onepanel_getUser: computed(function () {
    return {
      success() {
        return {
          username: MOCK_USERNAME,
        };
      }
    };
  }),

  _req_onepanel_modifyUser: computed(function () {
    return {
      success( /* ignore password */ ) {
        return null;
      }
    };
  }),

  _req_oneprovider_configureProvider: computed(function () {
    return {
      success: (data) => {
        let __provider = this.get('__provider');
        for (let prop in data) {
          __provider.set(prop, data[prop]);
        }
      },
      taskId: 'configure'
    };
  }),

  _req_oneprovider_modifyProvider: computed(function () {
    return {
      success: (data) => {
        let __provider = this.get('__provider');
        for (let prop in data) {
          __provider.set(prop, data[prop]);
          if (prop === 'name') {
            this.set('__configuration.oneprovider.name', data[prop]);
          }
        }

      },
      statusCode: () => 204,
    };
  }),

  _req_oneprovider_removeProvider: computed(function () {
    return {
      success: () => null,
      statusCode: () => 204,
    };
  }),

  _req_oneprovider_addProvider: computed(function () {
    return {
      success: () => null,
    };
  }),

  _req_oneprovider_addStorage: computed(function () {
    return {
      success: (storages) => {
        // the only storage is stored in the only key of storages
        let storage = _object.values(storages)[0];
        // generate some fake id
        let id = `id-${storage.name}`;
        this.get('__storages').push(_object.assign({ id }, storage));
      },
    };
  }),

  _req_oneprovider_getProviderConfiguration: computed('mockInitializedCluster',
    '__configuration',
    function () {
      if (this.get('mockInitializedCluster')) {
        return {
          success: () => this.get('__configuration').plainCopy()
        };
      } else {
        return {
          statusCode: () => 404
        };
      }
    }),

  _req_oneprovider_getProvider: computed('mockInitializedCluster', '__provider',
    function () {
      if (this.get('mockInitializedCluster')) {
        return {
          success: () => this.get('__provider').plainCopy(),
        };
      } else {
        return {
          statusCode: () => 404
        };
      }
    }),

  _req_oneprovider_getStorages: computed('__storages',
    function () {
      return {
        success: () => ({
          ids: this.get('__storages').map(s => s.id)
        })
      };
    }),

  _req_oneprovider_getStorageDetails: computed('__storages',
    function () {
      return {
        success: id => _find(this.get('__storages'), s => s.id === id)
      };
    }),

  _req_oneprovider_getProviderSpaces: computed('mockInitializedCluster', '__spaces.[]',
    function () {
      if (this.get('mockInitializedCluster')) {
        // TODO use Object.keys if available
        let spaces = this.get('__spaces');
        let spaceIds = spaces.map(s => s.id);
        return {
          success: () => ({
            ids: spaceIds,
          })
        };
      } else {
        return {
          statusCode: () => 404
        };
      }
    }),

  _req_oneprovider_getSpaceDetails: computed('mockInitializedCluster', 'spaces',
    function () {
      if (this.get('mockInitializedCluster')) {
        let spaces = this.get('__spaces');
        let findSpace = (id) => _find(spaces, s => s.id === id);
        return {
          success: (id) => findSpace(id),
          statusCode: (id) => findSpace(id) ? 200 : 404
        };
      } else {
        return {
          statusCode: () => 404
        };
      }
    }),

  // FIXME better mock
  _req_oneprovider_getProviderSpaceSyncStats: computed(function () {
    return {
      // FIXME mock should
      success: (spaceId, { period, metrics }) => {
        let space = _find(this.get('__spaces', s => s.id === spaceId));
        return this.generateSpaceSyncStats(space, period, metrics);
      }
    };
  }),

  // TODO: after revoking space support, do not return the space in getSpaces  
  _req_oneprovider_revokeSpaceSupport: computed(function () {
    return {
      success: () => null,
      statusCode: () => 204,
    };
  }),

  _req_oneprovider_modifySpace: computed(function () {
    let spaces = this.get('__spaces');
    return {
      success: (id, { storageImport, storageUpdate }) => {
        let space = _find(spaces, s => s.id === id);
        if (space) {
          if (storageImport) {
            space.storageImport = storageImport;
          }
          if (storageUpdate) {
            space.storageUpdate = storageUpdate;
          }
          return null;
        } else {
          return null;
        }
      },
      statusCode: (id) => {
        let space = _find(spaces, s => s.id === id);
        return space ? 204 : 404;
      },
    };
  }),

  _req_oneprovider_supportSpace: computed(function () {
    return {
      success: (supportSpaceRequest) => {
        supportSpaceRequest.id = 'id-' + Math.round(Math.random() * 100000, 0);
        supportSpaceRequest.name = 'Space-' + Math.round(Math.random() * 100, 0);
        delete supportSpaceRequest['token'];
        this.get('__spaces').pushObject(supportSpaceRequest);
      },
      statusCode: () => 204,
    };
  }),

  _req_onezone_configureZone: computed(function () {
    return {
      success: () => null,
      taskId: 'configure'
    };
  }),

  _req_onezone_getZoneConfiguration: computed('mockInitializedCluster',
    '__configuration',
    function () {
      if (this.get('mockInitializedCluster')) {
        return {
          success: () => this.get('__configuration').plainCopy()
        };
      } else {
        return {
          statusCode: () => 404
        };
      }
    }),

  // -- MOCKED RESOURCE STORE --

  __provider: PlainableObject.create({
    id: 'dfhiufhqw783t462rniw39r-hq27d8gnf8',
    name: 'Some provider 1',
    urls: ['172.17.0.4'],
    redirectionPoint: 'https://172.17.0.4',
    geoLatitude: 49.698284,
    geoLongitude: 21.898093,
  }),

  __configuration: PlainableObject.create({
    cluster: {
      databases: {
        hosts: ['node1.example.com'],
      },
      managers: {
        mainHost: 'node2.example.com',
        hosts: ['node1.example.com', 'node2.example.com'],
      },
      workers: {
        hosts: ['node2.example.com'],
      }
    },
    // TODO add this only in zone mode
    onezone: {
      name: null,
    },
    // TODO add this only in provider mode
    oneprovider: {
      name: null,
    },
  }),

  __storages: [],

  __spaces: A([]),
});
