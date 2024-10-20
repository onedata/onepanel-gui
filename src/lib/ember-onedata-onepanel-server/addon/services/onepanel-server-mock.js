/**
 * Mock for REST backend of onepanel
 *
 * See `REQ_HANDLER` in this file to manipulate responses
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { A } from '@ember/array';

import { Promise } from 'rsvp';
import { readOnly, reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import EmberObject, {
  set,
  get,
  setProperties,
  computed,
} from '@ember/object';
import { run } from '@ember/runloop';

import OnepanelServerBase from 'ember-onedata-onepanel-server/services/-onepanel-server-base';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import getTaskId from 'ember-onedata-onepanel-server/utils/get-task-id';
import DeploymentProgressMock from 'ember-onedata-onepanel-server/models/deployment-progress-mock';
import Plainable from 'onedata-gui-common/mixins/plainable';
import StorageImportStatsMock from 'ember-onedata-onepanel-server/mixins/storage-import-stats-mock';
import SpaceCleaningMock from 'ember-onedata-onepanel-server/mixins/space-cleaning-mock';
import SpaceCleaningReportsMock from 'ember-onedata-onepanel-server/mixins/space-cleaning-reports-mock';
import clusterStorageClass from 'ember-onedata-onepanel-server/utils/cluster-storage-class';
import emberObjectMerge from 'onedata-gui-common/utils/ember-object-merge';
import _ from 'lodash';
import moment from 'moment';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { installationStepsMap } from 'onepanel-gui/models/installation-details';
import Onepanel from 'onepanel';
import { onepanelAbbrev } from 'onedata-gui-common/utils/onedata-urls';
import globals from 'onedata-gui-common/utils/globals';

const {
  TaskStatus,
  TaskStatus: {
    StatusEnum,
  },
} = Onepanel;

const MOCK_USERNAME = 'mock_root';
const PROVIDER_ID = 'dfhiufhqw783t462rniw39r-hq27d8gnf8';
const PROVIDER1_ID = PROVIDER_ID;
const PROVIDER2_ID = 'dsnu8ew3724t3643t62344e-fdfdj8h78d';
const MOCKED_SUPPORT = {
  'lofrewu83yr78fghae78ft64aqry4-14uy48979fmur': 100000000,
  'fkmdeoswtg9y4895609byt746tb-7046506b7848958': 315000000,
  'o8t62yrfgt4y7eeyuaftgry9u896u78390658b9u0-2': 210000000,
};
const SERVICE_DOMAIN = 'dev-oneprovider-krakow.default.svc.cluster.local';
const SERVICE_NAME = 'dev-oneprovider-krakow';

const fallbackMockServiceType = 'oneprovider';
const baseQosParameters = {
  storageId: 'e777476baf3418ed9861a97750be285ech9802',
  providerId: '94ba8a6cf8d6c598c856c4ee78d506f0ch487e',
};

/**
 * Match using URL, because we know that this is NodeJS-based mocked backend,
 * and we don't want to use REST calls.
 * @returns {string} one of: onezone, oneprovider
 */
function getMockServiceType() {
  const url = globals.location.toString();
  if (/https:\/\/onezone.*(9443|\/onepanel)/.test(url)) {
    return 'onezone';
  } else if (/https:\/\/oneprovider.*(9443|\/onepanel)/.test(url)) {
    return 'oneprovider';
  } else {
    const clusterMatch = url.match(new RegExp(
      `${globals.location.origin}\\/${onepanelAbbrev}\\/(.*?)\\/.*`));
    if (clusterMatch) {
      return /oneprovider/.test(clusterMatch[1]) ? 'oneprovider' : 'onezone';
    } else {
      return fallbackMockServiceType;
    }
  }
}

const mockServiceType = getMockServiceType();

const mockSubdomain = (mockServiceType === 'oneprovider' ? 'oneprovider1' : 'onezone');

/**
 * Response delay in milliseconds
 * @type {number}
 */
const responseDelay = 100;

const defaultWebCert = {
  status: 'near_expiration',
  letsEncrypt: true,
  expirationTime: moment().subtract(2, 'months').add(4, 'years').toISOString(),
  creationTime: moment().subtract(2, 'months').toISOString(),
  paths: {
    cert: '/tmp/cert.pem',
    key: '/tmp/key.pem',
    chain: '/tmp/very_long_name_of_chain_very_long_name_of_chain_very_long_name_of_chain_very_long_name_of_chain_very_long_name_of_chain.ca',
  },
  domain: 'example.com',
  issuer: 'Example Inc.',
  lastRenewalSuccess: moment().subtract(1, 'week').toISOString(),
  lastRenewalFailure: null,
};

const defaultLetsEncryptDeployed = true;

/**
 * Used when generating providers support data
 */
let providerSupportCounter = 1;

/**
 * Used when generating file popularity tasks
 */
let popularityTaskCounter = 0;

const popularityTasks = {};

function getPopularityTask(taskId) {
  if (!popularityTasks.hasOwnProperty(taskId)) {
    popularityTasks[taskId] = TaskStatus.constructFromObject({
      status: StatusEnum.running,
    });
  }
  const task = popularityTasks[taskId];
  setTimeout(() => {
    task.status = StatusEnum.ok;
  }, 10000);
  return task;
}

function _genSupportingProviders() {
  const supportingProviders = {};
  supportingProviders[PROVIDER_ID] = 700000000 * providerSupportCounter;
  providerSupportCounter += 1;
  _.assign(supportingProviders, MOCKED_SUPPORT);
  return supportingProviders;
}

function _genAutoCleaningConfiguration(enabled = true) {
  return {
    minFileSize: {
      enabled,
      value: 10000,
    },
    maxFileSize: {
      enabled,
      value: 10000000,
    },
    minHoursSinceLastOpen: {
      enabled,
      value: 12,
    },
    maxOpenCount: {
      enabled,
      value: 10,
    },
    maxHourlyMovingAverage: {
      enabled,
      value: 11,
    },
    maxDailyMovingAverage: {
      enabled,
      value: 12,
    },
    maxMonthlyMovingAverage: {
      enabled,
      value: 13,
    },
  };
}

/**
 * A string serializer for generated mock responses
 * @returns {string}
 */
function responseToString() {
  return `Request ${this.__request_method} failed: ${JSON.stringify(this)}`;
}

const PlainableObject = EmberObject.extend(Plainable);

const zoneCluster = {
  id: 'onezone',
  type: 'onezone',
  serviceId: null,
  version: '18.07.0',
  build: '1900',
  proxy: false,
};
const providerCluster1 = {
  id: 'oneprovider1',
  type: 'oneprovider',
  serviceId: PROVIDER1_ID,
  version: '18.02.1',
  build: '7000',
  proxy: false,
};
const providerCluster2 = {
  id: 'oneprovider2',
  type: 'oneprovider',
  serviceId: PROVIDER2_ID,
  version: '18.02.0',
  build: '4000',
  proxy: true,
};
const providerClusters = [providerCluster1, providerCluster2];
const provider1 = PlainableObject.create({
  id: PROVIDER_ID,
  name: 'Some provider 1',
  domain: 'oneprovider1.local-onedata.org',
  geoLatitude: 49.698284,
  geoLongitude: 21.898093,
  online: true,
  cluster: providerCluster1.id,
  // non-remote properties
  onezoneDomainName: 'localhost',
  subdomainDelegation: true,
  letsEncryptEnabled: undefined,
  subdomain: 'somedomain',
  adminEmail: 'some@example.com',
});

/**
 * Mocked NodeJS-based environment has provider ID in its URL.
 * @returns {Object} mocked cluster record object
 */
function getCurrentProviderClusterFromUrl() {
  const url = globals.location.toString();
  const me = /https:\/\/(oneprovider.*?)\..*9443/.exec(url);
  const mh = new RegExp(`https://.*/${onepanelAbbrev}/(.*?)/.*/`).exec(url);
  const id = me && me[1] || mh && mh[1] || 'oneprovider1';
  return providerClusters.findBy('id', id);
}

export default OnepanelServerBase.extend(
  StorageImportStatsMock,
  SpaceCleaningMock,
  SpaceCleaningReportsMock, {
    cookies: service(),
    navigationState: service(),

    isMock: true,

    isLoading: readOnly('sessionValidator.isPending'),

    sessionValidator: computed(function () {
      const promise = this.validateSession();
      return PromiseObject.create({ promise });
    }).readOnly(),

    username: MOCK_USERNAME,

    // NOTE: Uncomment one of lines below to start onepanel-gui in specified
    // deployment step. See more in models/installation-details.
    //
    // mockStep: installationStepsMap.deploy,
    // mockStep: installationStepsMap.oneproviderRegistration,
    // mockStep: installationStepsMap.dns,
    // mockStep: installationStepsMap.oneproviderStorageAdd,
    mockStep: installationStepsMap.done,

    mockInitializedCluster: reads('mockStep.isFinalStep'),

    /**
     * @type {computed<Boolean>}
     */
    isInitialized: false,

    /**
     * Uncomment to force emergency mode
     * @type {boolean}
     */
    isEmergency: true,

    /**
     * Set to undefined here to see create admin account screen
     * @type {computed}
     */
    currentEmergencyPassphrase: 'password',

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

    staticRequest(api, method, params = []) {
      return this._request(true, api, method, ...params);
    },

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
      return this._request(false, api, method, ...params);
    },

    _request(staticReq, api, method, ...params) {
      const cookies = this.get('cookies');

      // TODO protect property read
      const promise = new Promise((resolve, reject) => {
        console.debug(
          `service:onepanel-server-mock: request API ${api}, method ${method}, params: ${JSON.stringify(params)}`
        );

        if (!staticReq && !cookies.read('is-authenticated') === 'true') {
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
          }, responseDelay);
        }

        const handlerName = `_req_${api}_${method}`;
        let handler = this.get(handlerName);
        if (typeof this[handlerName] === 'function') {
          handler = this[handlerName]();
        }
        if (handler) {
          if (handler.success) {
            const response = {
              statusCode: handler.statusCode &&
                handler.statusCode(...params) || 200,
              headers: {
                location: handler.taskId ? ('https://something/tasks/' +
                  handler.taskId) : undefined,
              },
            };
            const taskId = getTaskId(response);
            run.later(() => {
              const data = handler.success(...params);
              console.debug(
                `service:onepanel-server-mock: response: ${JSON.stringify(data)}, API ${api}, method ${method}, params: ${JSON.stringify(params)}`
              );
              resolve({
                __request_method: method,
                data,
                response: response,
                task: taskId && this.watchTaskStatus(taskId),
                toString: responseToString,
              });
            }, responseDelay);
          } else {
            const response = {
              statusCode: handler.statusCode && handler.statusCode(...params),
            };
            run.later(() => {
              reject({
                __request_method: method,
                response,
                toString: responseToString,
              });
            }, responseDelay);
          }

        } else {
          run.later(() => {
            reject(
              `onepanel-server-mock: mock has no method for: ${api}_${method}`
            );
          }, responseDelay);
        }
      });

      promise.catch(async error => await this.handleRequestError(error));

      return promise;
    },

    nodeProxy: computed(function () {
      return PromiseObject.create({
        promise: Promise.resolve({
          hostname: 'example.com',
          clusterType: mockServiceType,
        }),
      });
    }),

    watchTaskStatus(taskId) {
      return watchTaskStatus(this, taskId);
    },

    validateSession() {
      console.debug('service:onepanel-server-mock: validateSession');
      const cookies = this.get('cookies');
      const fakeLoginFlag = (cookies.read('is-authenticated') === 'true');
      const validating = new Promise((resolve, reject) => {
        if (fakeLoginFlag) {
          run.next(resolve);
        } else {
          run.next(reject);
        }
      });
      return validating.then(() => this.initClient({ token: 'mock-token' }))
        .then(() => ({ token: 'mock-token', username: MOCK_USERNAME }));
    },

    login(passphrase) {
      const currentEmergencyPassphrase = this.get('currentEmergencyPassphrase');
      console.debug('service:onepanel-server-mock: login');
      const cookies = this.get('cookies');
      const loginCall = new Promise((resolve, reject) => {
        if (passphrase === currentEmergencyPassphrase) {
          cookies.write('is-authenticated', 'true');
          run.next(resolve);
        } else {
          run.next(reject);
        }
      });
      return loginCall.then(() => this.validateSession());
    },

    init() {
      this._super(...arguments);
      const mockStep = this.get('mockStep');
      if (mockServiceType === 'oneprovider') {
        this.set('__dnsCheck', {
          domain: {
            summary: 'bad_records',
            got: ['192.168.0.1', '1.1.1.2'],
            expected: ['176.96.148.233', '192.168.0.1'],
            recommended: [
              'dev-onezone.default.svc.cluster.local. IN NS ns1.dev-onezone.default.svc.cluster.local',
              'dev-onezone.default.svc.cluster.local. IN NS ns2.dev-onezone.default.svc.cluster.local',
              'ns1.dev-onezone.default.svc.cluster.local. IN A 149.156.100.49',
              'ns2.dev-onezone.default.svc.cluster.local. IN A 149.156.100.49',
            ],
          },
        });
        this.set('__dnsCheckConfiguration', {
          dnsServers: ['8.8.8.8', '192.168.1.10'],
          builtInDnsServer: true,
          dnsCheckAcknowledged: mockStep.gt(installationStepsMap.dns),
        });

        if (mockStep.gt(installationStepsMap.oneproviderRegistration)) {
          this.set('__provider', provider1);
        }
        if (mockStep.gt(installationStepsMap.webCert)) {
          // TODO: deprecated __provider.letsEncryptEnabled
          this.set('__provider.letsEncryptEnabled', defaultLetsEncryptDeployed);
          this.set('__webCert.letsEncrypt', defaultLetsEncryptDeployed);
        }
        if (mockStep.gt(installationStepsMap.oneproviderStorageAdd)) {
          const storage1 = {
            id: 'storage1_verylongid',
            type: 'posix',
            name: 'Some storage',
            importedStorage: true,
            mountPoint: '/mnt/st1',
            lumaFeed: 'external',
            lumaFeedUrl: 'http://localhost:9090',
            lumaFeedApiKey: 'some_storage',
            readonly: true,
            qosParameters: Object.assign({}, baseQosParameters, {
              param1: 'abc',
              param2: 'def',
              param3: '123',
            }),
          };
          const storage2 = {
            id: 'storage2_verylongid',
            type: 'posix',
            name: 'Some storage',
            importedStorage: true,
            mountPoint: '/mnt/st2',
            lumaFeed: 'external',
            lumaFeedUrl: 'http://localhost:9090',
            lumaFeedApiKey: 'some_storage',
            readonly: false,
            rootUid: 1000,
            rootGid: 1000,
            qosParameters: Object.assign({}, baseQosParameters, {
              param1: 'abc',
              param2: 'def',
              param3: '123',
            }),
          };
          const storageCeph = {
            id: 'storage2_id',
            type: 'ceph',
            name: 'Deprecated ceph',
            monitorHostname: 'host.name',
            clusterName: 'cluster_name',
            poolName: 'some_pool',
            qosParameters: Object.assign({}, baseQosParameters),
          };
          const storageCephRados = {
            id: 'storage3_id',
            type: 'cephrados',
            name: 'Ceph RADOS',
            monitorHostname: 'host.name',
            clusterName: 'cluster_name',
            poolName: 'some_pool',
            importedStorage: true,
            qosParameters: Object.assign({}, baseQosParameters),
          };
          const storageHttp = {
            name: 'My HTTP server',
            verifyServerCertificate: false,
            type: 'http',
            storagePathType: 'canonical',
            readonly: true,
            qosParameters: Object.assign({}, baseQosParameters),
            lumaFeed: 'auto',
            importedStorage: true,
            id: 'e777476baf3418ed9861a97750be285ech9802',
            endpoint: 'http://172.17.0.3',
            credentialsType: 'none',
            connectionPoolSize: 150,
            authorizationHeader: 'Authorization: Bearer {}',
          };
          const storageNfs = {
            name: 'My NFS',
            type: 'nfs',
            storagePathType: 'canonical',
            readonly: false,
            qosParameters: Object.assign({}, baseQosParameters),
            lumaFeed: 'auto',
            importedStorage: false,
            id: 'my_nfs',
            host: 'nfs.example.com',
            version: 4,
            volume: '/nfs/mynfsvolume/',
            connectionPoolSize: 20,
            dirCache: true,
            readAhead: 1024,
            autoReconnect: 4,
          };
          this.set('__storages', this.get('__storages') || []);
          this.get('__storages').push(
            ...[
              storage1,
              storageCeph,
              storageCephRados,
              storage2,
              storageHttp,
              storageNfs,
            ].map(storage =>
              clusterStorageClass(storage.type).constructFromObject(storage)
            )
          );

          if (mockStep === installationStepsMap.done) {
            const spaces = this.get('__spaces');
            const spacesFilePopularity = this.get('__spacesFilePopularity');
            const spacesAutoCleaning = this.get('__spacesAutoCleaning');
            spaces.push({
              id: 'space1_verylongid',
              name: 'Space One One One One One One One One One One One One One One One One One One One One One One One One One One One One One One One One One One One One One One One',
              storageId: storage1.id,
              spaceOccupancy: 800000000,
              supportingProviders: _genSupportingProviders(),
              storageImport: {
                mode: 'manual',
              },
              accountingEnabled: true,
              dirStatsServiceEnabled: true,
              dirStatsServiceStatus: 'initializing',
            });
            spacesFilePopularity.push({
              id: 'space1_verylongid',
              enabled: true,
              exampleQuery: 'curl https://example.com',
              lastOpenHourWeight: 2,
              avgOpenCountPerDayWeight: 3,
              maxAvgOpenCountPerDay: 4,
            });
            spacesAutoCleaning.push({
              id: 'space1_verylongid',
              enabled: true,
              target: 100000000,
              threshold: 500000000,
              rules: _genAutoCleaningConfiguration(),
            });
            spaces.push({
              id: 'space2_verylongid',
              name: 'Space Two',
              storageId: storage2.id,
              spaceOccupancy: 800000000,
              storageImport: {
                mode: 'auto',
                autoStorageImportConfig: {
                  continuousScan: false,
                  maxDepth: 4,
                  syncAcl: true,
                },
              },
              supportingProviders: _genSupportingProviders(),
              accountingEnabled: false,
              dirStatsServiceEnabled: false,
              dirStatsServiceStatus: 'stopping',
            });
            _.times(2, i => {
              spaces.push({
                id: i + '-space',
                name: 'Test Space',
                storageId: storage1.id,
                spaceOccupancy: 700000000,
                supportingProviders: _genSupportingProviders(),
                accountingEnabled: false,
                dirStatsServiceEnabled: false,
                dirStatsServiceStatus: 'disabled',
              });
            });
          }
        } else {
          this.set('__storages', []);
        }
      } else if (mockServiceType === 'onezone') {
        this.set('__dnsCheck', {
          domain: {
            summary: 'missing_records',
            got: [],
            expected: ['176.96.148.233'],
            recommended: [
              'dev-onezone.default.svc.cluster.local. IN NS ns1.dev-onezone.default.svc.cluster.local',
              'dev-onezone.default.svc.cluster.local. IN NS ns2.dev-onezone.default.svc.cluster.local',
              'ns1.dev-onezone.default.svc.cluster.local. IN A 149.156.100.49',
              'ns2.dev-onezone.default.svc.cluster.local. IN A 149.156.100.49',
            ],
          },
          dnsZone: {
            summary: 'unresolvable',
            got: ['192.168.0.1', '192.168.0.2'],
            expected: ['192.168.0.1'],
            recommended: [
              'dev-onezone.default.svc.cluster.local. IN NS ns1.dev-onezone.default.svc.cluster.local',
            ],
          },
        });
        this.set('__dnsCheckConfiguration', {
          dnsServers: ['8.8.8.8', '192.168.1.10'],
          builtInDnsServer: false,
          dnsCheckAcknowledged: mockStep.gt(installationStepsMap.dns),
        });

        if (mockStep.gt(installationStepsMap.webCert)) {
          this.set('__webCert.letsEncrypt', defaultLetsEncryptDeployed);
        }

        if (mockStep.gt(installationStepsMap.dns)) {
          this.set('__zonePolicies', {
            subdomainDelegation: false,
          });
        } else {
          this.set('__zonePolicies', {
            subdomainDelegation: false,
          });
        }
      }

    },

    /**
     * Returns url of configuration endpoint
     * @returns {string}
     */
    getConfigurationEndpointUrl() {
      return globals.location.origin + '/configuration';
    },

    progressMock: computed(function progressMock() {
      return DeploymentProgressMock
        .create({ onepanelServiceType: mockServiceType });
    }),

    /// mocked request handlers - override to change server behaviour

    _req_SecurityApi_getWebCert() {
      const __webCert = this.get('__webCert');
      return {
        success() {
          return __webCert;
        },
        statusCode() {
          return __webCert ? 200 : 404;
        },
      };
    },

    _req_SecurityApi_modifyWebCert() {
      const __webCert = this.get('__webCert');
      return {
        success({ letsEncrypt }) {
          if (__webCert) {
            set(__webCert, 'letsEncrypt', letsEncrypt);
          } else {
            this.set(
              '__webCert',
              _.assign({ letsEncrypt }, defaultWebCert)
            );
          }
          return null;
        },
        statusCode: () => 204,
      };
    },

    _req_CurrentUserApi_getClusters() {
      const __clusters = this.get('__clusters');
      return {
        success: () => ({ ids: __clusters.mapBy('id') }),
      };
    },

    _req_CurrentUserApi_getCluster() {
      const __clusters = this.get('__clusters');
      const getCluster = id => __clusters.find(c => get(c, 'id') === id);
      return {
        success: id => getCluster(id),
        statusCode: id => getCluster(id) ? 200 : 404,
      };
    },

    _req_ClusterApi_getClusterHosts: computed(function () {
      return {
        success: () => {
          return _.clone(this.get('__clusterHosts'));
        },
      };
    }),

    _req_ClusterApi_getClusterCookie: computed(function () {
      return {
        success() {
          return 'some_cluster_cookie';
        },
      };
    }),

    _req_ClusterApi_getTaskStatus: computed('progressMock', function () {
      const progressMock = this.get('progressMock');
      return {
        success(taskId) {
          if (taskId === 'configure') {
            return progressMock.getTaskStatusConfiguration();
          } else if (taskId.startsWith('popularity')) {
            return getPopularityTask(taskId);
          } else {
            throw new Error(
              `service:onepanel-server-mock: task status not implmeneted for id: ${taskId}`
            );
          }
        },
      };
    }),

    _req_CurrentUserApi_getCurrentUser() {
      const isEmergency = this.get('isEmergency');
      if (isEmergency) {
        return {
          statusCode: () => 404,
        };
      } else {
        return {
          success() {
            return {
              userId: 'usrid123',
              username: MOCK_USERNAME,
              clusterPrivileges: [
                'cluster_view',
                'cluster_update',
                'cluster_delete',
                'cluster_view_privileges',
                'cluster_set_privileges',
                'cluster_add_user',
                'cluster_remove_user',
                'cluster_add_group',
                'cluster_remove_group',
              ],
            };
          },
        };
      }
    },

    _req_ClusterApi_getClusterMembersSummary() {
      return {
        success() {
          return {
            groupsCount: 1,
            usersCount: 2,
            effectiveGroupsCount: 3,
            effectiveUsersCount: 4,
          };
        },
      };
    },

    _req_ClusterApi_createUserInviteToken() {
      return {
        success() {
          return {
            token: 'user_invitation_token_1234567890',
          };
        },
      };
    },

    _req_OneproviderClusterApi_configureProvider() {
      this.set('mockStep', installationStepsMap.oneproviderRegistration);
      return {
        success: (data) => {
          const __provider = this.get('__provider') ||
            this.set('__provider', EmberObject.create({}));
          for (const prop in data) {
            __provider.set(prop, data[prop]);
          }
        },
        taskId: 'configure',
      };
    },

    _req_OneproviderIdentityApi_modifyProvider: computed(function () {
      return {
        success: (data) => {
          const __provider = this.get('__provider');
          for (const prop in data) {
            if (data[prop] !== undefined) {
              __provider.set(prop, data[prop]);
            }
            if (prop === 'name') {
              this.set('__configuration.oneprovider.name', data[prop]);
            } else if (prop === 'subdomain') {
              set(
                __provider,
                'domain',
                `${get(__provider, 'subdomain')}.${get(__provider, 'onezoneDomainName')}`
              );
            }
          }

        },
        statusCode: () => 204,
      };
    }),

    _req_OneproviderIdentityApi_removeProvider: computed(function () {
      return {
        success: () => null,
        statusCode: () => 204,
      };
    }),

    _req_OneproviderIdentityApi_addProvider: computed(function () {
      return {
        success: (provider) => {
          this.set('__provider', PlainableObject.create({ id: '3i92ry78ngq78' }));
          for (const prop in provider) {
            if (provider.hasOwnProperty(prop)) {
              this.set('__provider.' + prop, provider[prop]);
            }
          }
          this.set(
            '__provider.domain',
            provider.subdomain + '.' + provider.onezoneDomainName
          );
          return null;
        },
      };
    }),

    _req_StoragesApi_addStorage: computed(function () {
      return {
        success: (storages) => {
          // the only storage is stored in the only key of storages
          const storage = _.values(storages)[0];
          // generate some fake id
          const id = `id-${storage.name}`;
          this.get('__storages').push(
            clusterStorageClass(storage.type).constructFromObject(
              _.assign({ id }, storage)
            )
          );
          return { id };
        },
        statusCode: () => 200,
      };
    }),

    _req_StoragesApi_modifyStorage() {
      return {
        success: (id, storages) => {
          // find existing storage by id
          const storage = _.find(this.get('__storages'), { id });
          if (storage) {
            const storageValues = _.values(storages)[0];
            setProperties(storage, storageValues);
            // delete cleared (optional) fields
            _.keys(storage)
              .filter(key => storage[key] === null)
              .forEach(key => delete storage[key]);
          }
          if (get(storage, 'lumaFeed') !== 'external') {
            delete storage['lumaFeedUrl'];
            delete storage['lumaFeedApiKey'];
          }
          return _.assign({ verificationPassed: true }, storage);
        },
        statusCode: (id) => {
          const storages = this.get('__storages');
          const storage = _.find(storages, { id });
          return storage ? 200 : 404;
        },
      };
    },

    _req_StoragesApi_removeStorage() {
      const storages = this.get('__storages');
      return {
        success: id => {
          const storage = storages.findBy('id', id);
          if (storage) {
            storages.removeObject(storage);
          }
        },
        statusCode: id => storages.findBy('id', id) ? 204 : 404,
      };
    },

    _req_OneproviderClusterApi_getProviderConfiguration() {
      if (this.get('mockStep').gt(installationStepsMap.deploy)) {
        return {
          success: () => this.get('__configuration').plainCopy(),
        };
      } else {
        return {
          statusCode: () => 404,
        };
      }
    },

    _req_OneproviderIdentityApi_getProvider() {
      if (this.get('__provider')) {
        return {
          success: () => this.get('__provider').plainCopy(),
        };
      } else {
        return {
          statusCode: () => 404,
        };
      }
    },

    _req_StoragesApi_getStorages: computed('__storages',
      function () {
        return {
          success: () => ({
            ids: this.get('__storages').map(s => s.id),
          }),
        };
      }),

    _req_StoragesApi_getStorageDetails: computed('__storages',
      function () {
        return {
          success: id => _.find(this.get('__storages'), s => s.id === id),
        };
      }),

    _req_SpaceSupportApi_getProviderSpaces() {
      const {
        mockInitializedCluster,
        mockStep,
        __spaces,
      } = this.getProperties('mockInitializedCluster', 'mockStep', '__spaces');
      if (mockStep.gt(installationStepsMap.oneproviderRegistration)) {
        const spaceIds = mockInitializedCluster ? __spaces.mapBy('id') : [];
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
    },

    _req_SpaceSupportApi_getSpaceDetails() {
      if (this.get('mockInitializedCluster')) {
        const spaces = this.get('__spaces');
        const findSpace = (id) => _.find(spaces, s => s.id === id);
        return {
          success: (id) => findSpace(id),
          statusCode: (id) => findSpace(id) ? 200 : 404,
        };
      } else {
        return {
          statusCode: () => 404,
        };
      }
    },

    _req_StorageImportApi_getAutoStorageImportInfo: computed(function () {
      return {
        success: (spaceId) => {
          const space = _.find(this.get('__spaces'), s => s.id === spaceId);
          return this.generateStorageImportInfo(space);
        },
      };
    }),

    _req_StorageImportApi_getAutoStorageImportStats: computed(function () {
      return {
        success: (spaceId, period, metrics) => {
          const space = _.find(this.get('__spaces'), s => s.id === spaceId);
          return this.generateStorageImportStats(space, period, metrics);
        },
      };
    }),

    _req_StorageImportApi_getManualStorageImportExample() {
      return {
        success: (spaceId) => {
          return {
            curl: `curl -X POST -H "X-Auth-Token:$TOKEN" -H "content-type:application/json" \\
-d '{"storageId":"'$STORAGE_ID'", "spaceId":"${spaceId}", "storageFileId":"'$STORAGE_FILE_ID'", "destinationPath":"'$DESTINATION_PATH'"}' $ONEPROVIDER_HOST/api/v3/oneprovider/data/register`,
          };
        },
        statusCode: () => 200,
      };
    },

    // TODO: after revoking space support, do not return the space in getSpaces
    _req_oneprovider_revokeSpaceSupport: computed(function () {
      return {
        success: (spaceId) => {
          const __spaces = this.get('__spaces');
          this.set('__spaces', _.reject(__spaces, s => get(s, 'id') === spaceId));
        },
        statusCode: () => 200,
      };
    }),

    _req_SpaceSupportApi_modifySpace() {
      return {
        success: (id, data) => {
          const spaces = this.get('__spaces');
          const space = spaces.find(s => s.id === id);
          if (space) {
            if (data.autoStorageImportConfig) {
              set(space, 'storageImport.autoStorageImportConfig', data.autoStorageImportConfig);
              delete data.autoStorageImportConfig;
            }
            emberObjectMerge(space, data);
            if (data && data.size) {
              set(space, `supportingProviders.${PROVIDER_ID}`, data.size);
            }
            return null;
          } else {
            return null;
          }
        },
        statusCode: (id) => {
          const spaces = this.get('__spaces');
          const space = spaces.find(s => s.id === id);
          return space ? 204 : 404;
        },
      };
    },

    _req_FilePopularityApi_configureFilePopularity() {
      const taskId = `popularity-${popularityTaskCounter++}`;
      return {
        // data: enabled, [lastOpenHourWeight], [avgOpenCountPerDayWeight], [maxAvgOpenCountPerDay]
        success: (id, data) => {
          const spacesFilePopularity = this.get('__spacesFilePopularity');
          let configuration = spacesFilePopularity.find(s => s.id === id);
          if (!configuration) {
            configuration = { id };
            spacesFilePopularity.push(configuration);
          }
          const popEnabled = get(data, 'enabled');
          if (popEnabled === true) {
            setProperties(
              configuration,
              Object.assign({
                  exampleQuery: 'curl https://example.com/api/2',
                },
                data
              )
            );
          } else if (popEnabled === false) {
            let autoCleaningConfiguration =
              this.get('__spacesAutoCleaning').find(s => s.id === id);
            autoCleaningConfiguration = autoCleaningConfiguration || {};
            set(autoCleaningConfiguration, 'enabled', false);
          }

          emberObjectMerge(configuration, data);
        },
        statusCode: (id) => {
          const spacesFilePopularity = this.get('__spacesFilePopularity');
          const configuration = spacesFilePopularity.find(s => s.id === id);
          return configuration ? 204 : 404;
        },
        taskId,
      };
    },

    _req_FilePopularityApi_getFilePopularityConfiguration() {
      return {
        success: (id) => {
          const __spacesFilePopularity = this.get('__spacesFilePopularity');
          const configuration = __spacesFilePopularity.find(s => s.id === id);
          return _.cloneDeep(configuration);
        },
        statusCode: (id) => {
          const __spacesFilePopularity = this.get('__spacesFilePopularity');
          const configuration = __spacesFilePopularity.find(s => s.id === id);
          return configuration ? 204 : 404;
        },
      };
    },

    _req_AutoCleaningApi_configureSpaceAutoCleaning() {
      return {
        // data: { enabled, threshold, target, rules }
        success: (id, data) => {
          const spacesAutoCleaning = this.get('__spacesAutoCleaning');
          let configuration = spacesAutoCleaning.find(s => s.id === id);
          if (!configuration) {
            configuration = {
              id,
              rules: _genAutoCleaningConfiguration(false),
            };
            spacesAutoCleaning.push(configuration);
          }
          emberObjectMerge(configuration, data);
        },
        statusCode: (id) => {
          const spacesAutoCleaning = this.get('__spacesAutoCleaning');
          const configuration = spacesAutoCleaning.find(s => s.id === id);
          return configuration ? 204 : 404;
        },
      };
    },

    _req_AutoCleaningApi_getSpaceAutoCleaningConfiguration() {
      return {
        success: (id) => {
          const spacesAutoCleaning = this.get('__spacesAutoCleaning');
          const configuration = spacesAutoCleaning.find(s => s.id === id);
          return _.cloneDeep(configuration);
        },
        statusCode: (id) => {
          const spacesAutoCleaning = this.get('__spacesAutoCleaning');
          const configuration = spacesAutoCleaning.find(s => s.id === id);
          return configuration ? 204 : 404;
        },
      };
    },

    _req_SpaceSupportApi_supportSpace: computed(function () {
      return {
        success: (supportSpaceRequest) => {
          const space = _.clone(supportSpaceRequest);
          space.id = 'id-' + Math.round(Math.random() * 100000, 0);
          space.name = 'Space-' + Math.round(Math.random() * 100, 0);
          space.supportingProviders = _genSupportingProviders();
          delete space['token'];
          this.get('__spaces').pushObject(space);
        },
        statusCode: () => 204,
      };
    }),

    _req_OnezoneClusterApi_configureZone() {
      this.set('mockStep', installationStepsMap.ips);
      return {
        success: () => null,
        taskId: 'configure',
      };
    },

    _req_OnezoneClusterApi_getZoneConfiguration() {
      if (this.get('mockStep').gt(installationStepsMap.deploy)) {
        return {
          success: () => this.get('__configuration').plainCopy(),
        };
      } else {
        return {
          statusCode: () => 404,
        };
      }
    },

    _req_AutoCleaningApi_getProviderSpaceAutoCleaningReports: computed(
      function () {
        return {
          success: (spaceId, { index, limit, offset }) =>
            this._getReportIds(spaceId, index, limit, offset),
          statusCode: () => 200,
        };
      }
    ),

    _req_AutoCleaningApi_getProviderSpaceAutoCleaningReport: computed(
      function () {
        return {
          success: (spaceId, reportId) => this._getReport(spaceId, reportId),
          statusCode: () => 200,
        };
      }
    ),

    _req_AutoCleaningApi_getProviderSpaceAutoCleaningStatus: computedResourceGetHandler(
      '__spaceAutoCleaningStates', {
        lastRunStatus: 'completed',
        spaceOccupancy: 250000000,
      }
    ),

    _req_AutoCleaningApi_triggerAutoCleaning: computed(function () {
      return {
        success: (id) => {
          this._getAutoCleaningStatusMock(id).forceStart();
          this._addReport(id);
          return undefined;
        },
        statusCode: () => 200,
      };
    }),

    _req_AutoCleaningApi_cancelAutoCleaning: computed(function () {
      return {
        success: (id) => {
          this._changeStatusToCancelled(id);
          this._getAutoCleaningStatusMock(id).stop();
          return undefined;
        },
        statusCode: () => 200,
      };
    }),

    // TODO: maybe implement real
    _req_OneproviderClusterApi_modifyProviderClusterIps() {
      return {
        success: () => 204,
      };
    },

    // TODO: maybe implement real
    _req_OnezoneClusterApi_modifyZoneClusterIps() {
      return {
        success: () => 204,
      };
    },

    _req_OneproviderClusterApi_getProviderClusterIps() {
      return {
        success: () => ({
          isConfigured: this.get('mockStep').gt(installationStepsMap.ips),
          hosts: {
            'node2.example.com': '127.0.0.1',
            'node3.example.com': '192.168.0.4',
          },
        }),
      };
    },

    _req_OnezoneClusterApi_getZoneClusterIps() {
      return {
        success: () => ({
          isConfigured: this.get('mockStep').gt(installationStepsMap.ips),
          hosts: {
            'node2.example.com': '127.0.0.1',
            'node3.example.com': '192.168.0.4',
          },
        }),
      };
    },

    _req_ClusterApi_addClusterHost() {
      const __clusterHosts = this.get('__clusterHosts');
      return {
        success: ({ address: hostname }) => {
          __clusterHosts.push(hostname);
          return {
            hostname,
          };
        },
        statusCode: () => 204,
      };
    },

    _req_ClusterApi_removeClusterHost() {
      const __clusterHosts = this.get('__clusterHosts');
      return {
        success: (hostname) => {
          _.remove(__clusterHosts, hostname);
        },
        statusCode: () => 204,
      };
    },

    _req_ClusterApi_getNode() {
      return {
        success: () => ({
          hostname: `${mockSubdomain}.local-onedata.org`,
          clusterType: `one${mockServiceType}`,
        }),
        statusCode: () => 200,
      };
    },

    _req_DNSApi_checkDns() {
      const __dnsCheck = this.get('__dnsCheck');
      const builtInDnsServer = this.get('__dnsCheckConfiguration.builtInDnsServer');
      const check = builtInDnsServer ? { domain: __dnsCheck.domain } : __dnsCheck;
      return {
        success: ({ forceCheck }) => {
          if (forceCheck) {
            this.set('__dnsCheckTimestamp', moment().toISOString());
          }
          return Object.assign({ timestamp: this.get('__dnsCheckTimestamp') },
            check);
        },
      };
    },

    _req_DNSApi_getDnsCheckConfiguration() {
      const __dnsCheckConfiguration = this.get('__dnsCheckConfiguration');
      return {
        success() {
          return __dnsCheckConfiguration;
        },
      };
    },

    _req_DNSApi_modifyDnsCheckConfiguration() {
      const __dnsCheckConfiguration = this.get('__dnsCheckConfiguration');
      return {
        success(data) {
          setProperties(__dnsCheckConfiguration, data);
          return undefined;
        },
      };
    },

    _req_ServiceConfigurationApi_getZonePolicies() {
      const __zonePolicies = this.get('__zonePolicies');
      return {
        success() {
          return __zonePolicies;
        },
      };
    },

    _req_ServiceConfigurationApi_modifyZonePolicies() {
      const __zonePolicies = this.get('__zonePolicies');
      return {
        success(data) {
          return setProperties(__zonePolicies, data);
        },
      };
    },

    _req_OneproviderIdentityApi_getOnezoneInfo() {
      return {
        success: ({ token }) => {
          let online = true;
          let compatible = true;
          if (token) {
            switch (token.trim()) {
              case 'offline':
                online = false;
                break;
              case 'not-compatible':
                compatible = false;
                break;
              default:
                break;
            }
          }
          return {
            domain: 'onezone.local-onedata.org',
            name: 'Hello Onezone',
            online,
            subdomainDelegationSupported: false,
            compatible,
            version: '18.02.0',
          };
        },
        statusCode: () => 200,
      };
    },

    _req_ClusterApi_getCurrentCluster() {
      return {
        success: () => (mockServiceType === 'oneprovider' ?
          getCurrentProviderClusterFromUrl() : zoneCluster),
      };
    },

    _req_InternalApi_getRemoteProvider() {
      const __remoteProviders = this.get('__remoteProviders');
      return {
        success: id => __remoteProviders.findBy('id', id),
        statusCode: id => __remoteProviders.findBy('id', id) ? 200 : 404,
      };
    },

    _req_ClusterApi_getConfiguration() {
      const {
        mockStep,
        isEmergency,
      } = this.getProperties('mockStep', 'isEmergency');
      return {
        success: () => ({
          clusterId: isEmergency ?
            (
              mockServiceType === 'oneprovider' ?
              providerCluster1.id :
              zoneCluster.id
            ) : this.get('guiContext.clusterId'),
          version: '18.02.0-rc13',
          build: '2100',
          deployed: mockStep.gt(installationStepsMap.deploy),
          isRegistered: (mockServiceType === 'oneprovider' || undefined) &&
            mockStep.gt(installationStepsMap.oneproviderRegistration),
          serviceType: mockServiceType,
          zoneDomain: 'onezone.local-onedata.org',
          providerDomain: SERVICE_DOMAIN,
          providerName: SERVICE_NAME,
        }),
        statusCode: () => 200,
      };
    },

    _req_SecurityApi_getEmergencyPassphraseStatus() {
      return {
        success: () => ({ isSet: Boolean(this.get('currentEmergencyPassphrase')) }),
        statusCode: () => 200,
      };
    },

    _req_SecurityApi_setEmergencyPassphrase() {
      return {
        success: ({ newPassphrase }) => {
          this.set('currentEmergencyPassphrase', newPassphrase);
        },
        statusCode: () => 200,
      };
    },

    _req_ServiceConfigurationApi_getGuiMessage() {
      return {
        success: (id) => {
          return this.get(`__guiMessages.${id}`);
        },
      };
    },

    _req_ServiceConfigurationApi_modifyGuiMessage() {
      return {
        success: (id, message) => {
          this.set(`__guiMessages.${id}`, message);
        },
        statusCode: () => 200,
      };
    },

    // -- MOCKED RESOURCE STORE --

    __remoteProviders: computed('__provider', function __remoteProviders() {
      return [
        provider1,
        {
          id: PROVIDER2_ID,
          name: 'Some provider 2',
          domain: 'oneprovider2.local-onedata.org',
          geoLatitude: 49.698284,
          geoLongitude: 21.898093,
          online: true,
          cluster: providerCluster2.id,
        },
      ];
    }),

    __clusters: computed(function __clusters() {
      return [
        zoneCluster,
        providerCluster1,
        providerCluster2,
      ];
    }),

    __clusterHosts: computed(function () {
      return ['example.com'];
    }),

    // space id -> AutCleaningStatus
    __spaceAutoCleaningStates: computed(function () {
      const self = this;
      return {
        get space1_verylongid() {
          return self._getAutoCleaningStatus('space1_verylongid');
        },
      };
    }),

    __dnsCheck: undefined,

    __dnsCheckTimestamp: moment(1530000000000).toISOString(),

    __dnsCheckConfiguration: undefined,

    __zonePolicies: undefined,

    __provider: undefined,

    __webCert: defaultWebCert,

    __configuration: computed(function __configuration() {
      const configuration = {
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
      };
      if (mockServiceType === 'oneprovider') {
        Object.assign(configuration, {
          oneprovider: {
            name: null,
          },
        });
      } else {
        Object.assign(configuration, {
          onezone: {
            name: null,
            domainName: globals.location.hostname,
          },
        });
      }
      return PlainableObject.create(configuration);
    }),

    __storages: undefined,

    __spaces: A([]),

    __spacesFilePopularity: A([]),

    __spacesAutoCleaning: A([]),

    __blockDevices: A([{
      path: 'a',
      size: 10000000000,
      mounted: false,
    }, {
      path: 'b',
      size: 20000000000,
      mounted: false,
    }, {
      path: 'c',
      size: 1073741312,
      mounted: false,
    }, {
      path: 'd',
      size: 1073741312,
      mounted: true,
    }]),

    __guiMessages: computed(() => ({
      signin_notification: {
        enabled: false,
        body: '',
      },
      privacy_policy: {
        enabled: true,
        body: '<h1>Privacy policy of Mocked Onedata</h1><p>Yes, but no, but yes.</p> <button class="btn btn-sm btn-default" onclick="javascript:alert(\'hacked\')">Injected dangerous button</button>',
      },
      terms_of_use: {
        enabled: true,
        body: '<h1>Terms of use of Mocked Onedata</h1><p>Yes, but no, but yes.</p> <button class="btn btn-sm btn-default" onclick="javascript:alert(\'hacked\')">Injected dangerous button</button>',
      },
      cookie_consent_notification: {
        enabled: true,
        body: 'Cookies! [privacy-policy]see privacy policy[/privacy-policy] and [terms-of-use]see terms of use[/terms-of-use]',
      },
    })),
  }
);

function computedResourceGetHandler(storeProperty, defaultData) {
  return computed(function () {
    const self = this;
    return {
      success: (id) => {
        const record = get(this, `${storeProperty}.${id}`);
        if (record) {
          return record;
        } else {
          return (typeof defaultData === 'function') ?
            defaultData.bind(self)() : defaultData;
        }
      },
    };
  });
}

// TODO: not used now, but may be used in future
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
