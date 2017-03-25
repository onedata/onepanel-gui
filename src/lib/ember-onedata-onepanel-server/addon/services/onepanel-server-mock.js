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

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

const {
  RSVP: {
    Promise
  },
  computed,
  computed: {
    readOnly
  },
  inject: {
    service
  }
} = Ember;

export default Ember.Service.extend({
  cookies: service(),

  isLoading: readOnly('sessionValidator.isPending'),

  sessionValidator: computed(function () {
    let cookies = this.get('cookies');
    let fakeLoginFlag = cookies.read('fakeLoginFlag');
    return ObjectPromiseProxy.create({
      promise: new Promise((resolve, reject) => {
        if (fakeLoginFlag) {
          resolve();
        } else {
          reject();
        }
      })
    });
  }).readOnly(),

  /**
   * @type {computed<Boolean>}
   */
  isInitialized: false,

  initClient() {
    this.set('isInitialized', true);
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
    // TODO protect property read
    return new Promise((resolve, reject) => {
      let handler = REQ_HANDLER[`${api}_${method}`];
      if (handler) {
        if (handler.success) {
          let response = {
            statusCode: handler.statusCode || 200,
            headers: {
              location: handler.taskId ? ('https://something/' +
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
            statusCode: handler.statusCode,
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
  },

  watchTaskStatus(taskId) {
    return watchTaskStatus(this, taskId);
  },

  login(username, password) {
    let cookies = this.get('cookies');
    return new Promise((resolve, reject) => {
      if (username === 'admin' && password === 'password') {
        cookies.write('fakeLoginFlag', true);
        resolve();
      } else {
        reject();
      }
    });
  },

  init() {
    this._super(...arguments);
  },

});

const PROGRESS_MOCK = DeploymentProgressMock.create();

// TODO: make req handlers public to allow modifying mocks

/**
 * Functions returning values in callback on API call success.
 */
const REQ_HANDLER = {
  onepanel_getClusterHosts: {
    success() {
      return ['node1', 'node2'];
    },
  },
  onepanel_getClusterCookie: {
    success() {
      return 'some_cluster_cookie';
    },
  },
  onepanel_getTaskStatus: {
    success(taskId) {
      if (taskId === 'configure') {
        return PROGRESS_MOCK.getTaskStatusConfiguration();
      } else {
        return null;
      }
    }
  },
  oneprovider_configureProvider: {
    success() {
      return null;
    },
    taskId: 'configure'
  },
  oneprovider_addProvider: {
    success() {
      return null;
    }
  },
  oneprovider_addStorage: {
    success() {
      return null;
    }
  },
  oneprovider_getProviderConfiguration: {
    statusCode: 404,
  },
  oneprovider_getProvider: {
    statusCode: 404,
  },
  oneprovider_getStorages: {
    success() {
      return [];
    }
  },

  onezone_configureZone: {
    success() {
      return null;
    },
    taskId: 'configure'
  },
  onezone_getZoneConfiguration: {
    statusCode: 404,
  },
};
