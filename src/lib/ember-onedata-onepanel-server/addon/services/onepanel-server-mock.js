/**
 * Mock for REST backend of onepanel
 *
 * See `REQ_HANDLER` in this file to manipulate responses
 *
 * @module services/onepanel-server-mock
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import OnepanelServerBase from 'ember-onedata-onepanel-server/services/-onepanel-server-base';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import getTaskId from 'ember-onedata-onepanel-server/utils/get-task-id';
import DeploymentProgressMock from 'ember-onedata-onepanel-server/models/deployment-progress-mock';
import Plainable from 'onedata-gui-common/mixins/plainable';
import SpaceSyncStatsMock from 'ember-onedata-onepanel-server/mixins/space-sync-stats-mock';
import clusterStorageClass from 'ember-onedata-onepanel-server/utils/cluster-storage-class';
import emberObjectMerge from 'onedata-gui-common/utils/ember-object-merge';
import _ from 'lodash';

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const {
  A,
  RSVP: {
    Promise,
  },
  computed,
  computed: {
    readOnly,
  },
  inject: {
    service,
  },
  get,
  set,
  run,
} = Ember;

const MOCK_USERNAME = 'mock_admin';
const PROVIDER_ID = 'dfhiufhqw783t462rniw39r-hq27d8gnf8';
const MOCKED_SUPPORT = {
  'lofrewu83yr78fghae78ft64aqry4-14uy48979fmur': 100000000,
  'fkmdeoswtg9y4895609byt746tb-7046506b7848958': 315000000,
  'o8t62yrfgt4y7eeyuaftgry9u896u78390658b9u0-2': 210000000,
};

const MOCK_SERVICE_TYPE = 'provider';

/** In milliseconds @type {number} */
const RESPONSE_DELAY = 1;

let providerSupportCounter = 1;

function _genSupportingProviders() {
  let supportingProviders = {};
  supportingProviders[PROVIDER_ID] = 700000000 * providerSupportCounter;
  providerSupportCounter += 1;
  _.assign(supportingProviders, MOCKED_SUPPORT);
  return supportingProviders;
}

function _genAutoCleaningSettings() {
  return {
    fileSizeGreaterThan: 10000,
    fileSizeLesserThan: 10000000,
    fileTimeNotActive: 60 * 60 * 12,
    spaceSoftQuota: 100000,
    spaceHardQuota: 10000000,
  };
}

function _genAutoCleaning() {
  return {
    enabled: true,
    settings: _genAutoCleaningSettings(),
  };
}

function _genReport(duration = 1, isSuccess = true) {
  const startedAt = new Date();
  startedAt.setHours(startedAt.getHours() - duration - 1);
  const stoppedAt = new Date(startedAt);
  stoppedAt.setHours(stoppedAt.getHours() - duration);
  return {
    startedAt,
    stoppedAt,
    releasedSize: 1024 * 1024 * 50,
    plannedReleasedSize: 1024 * 1024 * 75,
    filesNumber: 80,
    status: isSuccess ? 'success' : 'failure',
  };
}

/**
 * A string serializer for generated mock responses
 * @returns {string}
 */
function responseToString() {
  return `Request ${this.__request_method} failed: ${JSON.stringify(this)}`;
}

const PlainableObject = Ember.Object.extend(Plainable);

export default OnepanelServerBase.extend(SpaceSyncStatsMock, {
  cookies: service(),

  isLoading: readOnly('sessionValidator.isPending'),

  sessionValidator: computed(function () {
    let promise = this.validateSession();
    return PromiseObject.create({ promise });
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
  serviceType: null,

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

  fetchAndSetServiceType() {
    return new Promise(resolve => {
      this.set('serviceType', MOCK_SERVICE_TYPE);
      resolve(MOCK_SERVICE_TYPE);
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
        run.later(() => {
          reject({
            __request_method: method,
            response: {
              statusCode: 401,
              body: {
                error: 'Unauthorized',
                description: 'User not authorized',
              },
            },
            toString: responseToString,
          });
        }, RESPONSE_DELAY);
      }

      let handler = this.get(`_req_${api}_${method}`);
      if (handler) {
        if (handler.success) {
          let response = {
            statusCode: handler.statusCode &&
              handler.statusCode(...params) || 200,
            headers: {
              location: handler.taskId ? ('https://something/tasks/' +
                handler.taskId) : undefined,
            },
          };
          let taskId = getTaskId(response);
          run.later(() => {
            resolve({
              __request_method: method,
              data: handler.success(...params),
              response: response,
              task: taskId && this.watchTaskStatus(taskId),
              toString: responseToString,
            }, RESPONSE_DELAY);
          });
        } else {
          let response = {
            statusCode: handler.statusCode && handler.statusCode(...params),
          };
          run.later(() => {
            reject({ __request_method: method, response, toString: responseToString });
          }, RESPONSE_DELAY);
        }

      } else {
        run.later(() => {
          reject(
            `onepanel-server-mock: mock has no method for: ${api}_${method}`
          );
        }, RESPONSE_DELAY);
      }
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
        run.next(resolve);
      } else {
        run.next(reject);
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
        run.next(resolve);
      } else {
        run.next(reject);
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
        lumaEnabled: true,
        lumaUrl: 'http://localhost:9090',
        lumaCacheTimeout: 10,
        lumaApiKey: 'some_storage',
      };
      this.get('__storages').push(
        clusterStorageClass(storage1.type).constructFromObject(storage1)
      );
      let spaces = this.get('__spaces');
      spaces.push({
        id: 'space1_verylongid',
        name: 'Space One',
        storageId: storage1.id,
        mountInRoot: true,
        storageImport: {
          strategy: 'no_import',
        },
        storageUpdate: {
          strategy: 'no_update',
        },
        supportingProviders: _genSupportingProviders(),
        filesPopularity: {
          enabled: true,
          restUrl: 'https://example.com',
        },
        autoCleaning: {
          enabled: true,
          settings: _genAutoCleaningSettings(),
        },
      });
      spaces.push({
        id: 'space2__verylongid',
        name: 'Space Two',
        storageId: storage1.id,
        storageImport: {
          strategy: 'simple_scan',
          maxDepth: 4,
          syncAcl: true,
        },
        storageUpdate: {
          strategy: 'simple_scan',
          maxDepth: 3,
          scanInterval: 1000,
          writeOnce: false,
          deleteEnable: false,
          syncAcl: true,
        },
        supportingProviders: _genSupportingProviders(),
      });
      // additional spaces to test issue VFS-3673
      // FIXME: disabled for manual tests, re-enable before merging
      _.times(0, i => {
        spaces.push({
          id: i + '-space',
          name: 'Test Space',
          storageId: storage1.id,
          supportingProviders: _genSupportingProviders(),
        });
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
      },
    };
  }),

  // currently mocked - waiting for real logout method
  _req_onepanel_removeSession: computed(function () {
    return {
      success() {
        document.cookie = 'fakeLoginFlag=false; Max-Age=0';
        return null;
      },
    };
  }),

  _req_onepanel_getUser: computed(function () {
    return {
      success() {
        return {
          username: MOCK_USERNAME,
        };
      },
    };
  }),

  _req_onepanel_modifyUser: computed(function () {
    return {
      success( /* ignore password */ ) {
        return null;
      },
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
      taskId: 'configure',
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
        let storage = _.values(storages)[0];
        // generate some fake id
        let id = `id-${storage.name}`;
        this.get('__storages').push(
          clusterStorageClass(storage.type).constructFromObject(
            _.assign({ id }, storage)
          )
        );
      },
    };
  }),

  _req_oneprovider_getProviderConfiguration: computed('mockInitializedCluster',
    '__configuration',
    function () {
      if (this.get('mockInitializedCluster')) {
        return {
          success: () => this.get('__configuration').plainCopy(),
        };
      } else {
        return {
          statusCode: () => 404,
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
          statusCode: () => 404,
        };
      }
    }),

  _req_oneprovider_getStorages: computed('__storages',
    function () {
      return {
        success: () => ({
          ids: this.get('__storages').map(s => s.id),
        }),
      };
    }),

  _req_oneprovider_getStorageDetails: computed('__storages',
    function () {
      return {
        success: id => _.find(this.get('__storages'), s => s.id === id),
      };
    }),

  _req_oneprovider_getProviderSpaces: computed('mockInitializedCluster',
    '__spaces.[]',
    function () {
      if (this.get('mockInitializedCluster')) {
        // TODO use Object.keys if available
        let spaces = this.get('__spaces');
        let spaceIds = spaces.map(s => s.id);
        return {
          success: () => ({
            ids: spaceIds,
          }),
        };
      } else {
        return {
          statusCode: () => 404,
        };
      }
    }),

  _req_oneprovider_getSpaceDetails: computed('mockInitializedCluster', 'spaces',
    function () {
      if (this.get('mockInitializedCluster')) {
        let spaces = this.get('__spaces');
        let findSpace = (id) => _.find(spaces, s => s.id === id);
        return {
          success: (id) => findSpace(id),
          statusCode: (id) => findSpace(id) ? 200 : 404,
        };
      } else {
        return {
          statusCode: () => 404,
        };
      }
    }),

  _req_oneprovider_getProviderSpaceSyncStats: computed(function () {
    return {
      success: (spaceId, { period, metrics }) => {
        let space = _.find(this.get('__spaces', s => s.id === spaceId));
        return this.generateSpaceSyncStats(space, period, metrics);
      },
    };
  }),

  // TODO: after revoking space support, do not return the space in getSpaces  
  _req_oneprovider_revokeSpaceSupport: computed(function () {
    return {
      success: (spaceId) => {
        let __spaces = this.get('__spaces');
        this.set('__spaces', _.reject(__spaces, s => get(s, 'id') === spaceId));
      },
      statusCode: () => 200,
    };
  }),

  _req_oneprovider_modifySpace: computed(function () {
    return {
      success: (id, data) => {
        let spaces = this.get('__spaces');
        let space = _.find(spaces, s => s.id === id);
        if (space) {
          const popEnabled = get(data, 'filesPopularity.enabled');
          if (popEnabled === true) {
            set(data, 'filesPopularity.restUrl', 'https://example.com/api/2');
          } else if (popEnabled === false) {
            set(data, 'autoCleaning', { enabled: false });
          }
          const cleanEnabled = get(data, 'autoCleaning.enabled');
          if (cleanEnabled === true) {
            set(data, 'autoCleaning', _genAutoCleaning());
          } else if (cleanEnabled === false) {
            set(data, 'autoCleaning', { enabled: false });
          }
          emberObjectMerge(space, data);
          return null;
        } else {
          return null;
        }
      },
      statusCode: (id) => {
        let spaces = this.get('__spaces');
        let space = _.find(spaces, s => s.id === id);
        return space ? 204 : 404;
      },
    };
  }),

  _req_oneprovider_supportSpace: computed(function () {
    return {
      success: (supportSpaceRequest) => {
        let space = _.clone(supportSpaceRequest);
        space.id = 'id-' + Math.round(Math.random() * 100000, 0);
        space.name = 'Space-' + Math.round(Math.random() * 100, 0);
        space.supportingProviders = _genSupportingProviders();
        delete space['token'];
        this.get('__spaces').pushObject(space);
      },
      statusCode: () => 204,
    };
  }),

  _req_onezone_configureZone: computed(function () {
    return {
      success: () => null,
      taskId: 'configure',
    };
  }),

  _req_onezone_getZoneConfiguration: computed('mockInitializedCluster',
    '__configuration',
    function () {
      if (this.get('mockInitializedCluster')) {
        return {
          success: () => this.get('__configuration').plainCopy(),
        };
      } else {
        return {
          statusCode: () => 404,
        };
      }
    }),

  _req_oneprovider_getProviderSpaceAutoCleaningReports: computedResourceGetHandler(
    '__spaceAutoCleaningReports', {
      reportEntries: [],
    }
  ),

  _req_oneprovider_getProviderSpaceAutoCleaningStatus: computedResourceGetHandler(
    '__spaceAutoCleaningStatus'
  ),

  // -- MOCKED RESOURCE STORE --

  // FIXME: make dynamic in mock
  // space id -> AutCleaningStatus
  __spaceAutoCleaningStatus: PlainableObject.create({
    isWorking: true,
    spaceUsed: 100000,
  }),

  // space id -> AutoCleaningReports object
  __spaceAutoCleaningReports: PlainableObject.create({
    reportEntries: [
      _genReport(1, true),
      _genReport(2, false),
    ],
  }),

  __provider: PlainableObject.create({
    id: PROVIDER_ID,
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
      },
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

function computedResourceGetHandler(storeProperty, defaultData) {
  return computed(function () {
    return {
      success: (id) => {
        const record = get(this, `${storeProperty}.${id}`);
        return record || defaultData;
      },
    };
  });
}

// FIXME: to use
// function computedResourceSetHandler(storeProperty, defaultData = {}) {
//   return computed(function () {
//     return {
//       success: (id, data) => {
//         return {
//           success: (id) => {
//             const record = get(this, `${storeProperty}.${id}`);
//             if (record) {
//               return setProperties(record, _.assign({}, defaultData, record));
//             } else {
//               return set(record, id, data);
//             }
//           },
//         };
//       },
//     };
//   });
// }
