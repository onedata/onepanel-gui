/**
 * Information about installation of cluster
 *
 * @module models/installation-details
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ObjectProxy from '@ember/object/proxy';
import { get, set } from '@ember/object';
import { alias, reads } from '@ember/object/computed';
import InstallationStep from 'onepanel-gui/utils/installation-step';

export const InstallationStepsArray = Object.freeze([
  InstallationStep.create({
    name: 'deploy',
  }),
  InstallationStep.create({
    name: 'oneproviderCeph',
    inOnezone: false,
  }),
  InstallationStep.create({
    name: 'deploymentProgress',
    isHiddenStep: true,
  }),
  InstallationStep.create({
    name: 'oneproviderRegister',
    inOnezone: false,
  }),
  InstallationStep.create({
    name: 'ips',
  }),
  InstallationStep.create({
    name: 'dns',
  }),
  InstallationStep.create({
    name: 'webCert',
  }),
  InstallationStep.create({
    name: 'oneproviderStorageAdd',
    inOnezone: false,
  }),
  InstallationStep.create({
    name: 'done',
    isFinalStep: true,
  }),
]);

InstallationStepsArray
  .forEach(step => set(step, 'stepsOrder', InstallationStepsArray));

export const InstallationStepsMap = Object.freeze(
  InstallationStepsArray.reduce((map, step) => {
    map[get(step, 'name')] = step;
    return map;
  }, {})
);

// export const CLUSTER_INIT_STEPS = Object.freeze({
//   DEPLOY: 0,
//   // pseudo-step: should be always between DEPLOY and DEPLOY + 1
//   DEPLOYMENT_PROGRESS: 1.5,
//   ZONE_DEPLOY: 0,
//   ZONE_IPS: 1,
//   ZONE_DNS: 2,
//   ZONE_WEB_CERT: 3,
//   ZONE_DONE: 4,
//   PROVIDER_DEPLOY: 0,
//   PROVIDER_CEPH: 1,
//   PROVIDER_REGISTER: 2,
//   PROVIDER_IPS: 3,
//   PROVIDER_DNS: 4,
//   PROVIDER_WEB_CERT: 5,
//   PROVIDER_STORAGE_ADD: 6,
//   PROVIDER_DONE: 7,
// });

export default ObjectProxy.extend({
  content: alias('clusterInfo'),

  /**
   * @type {string}
   */
  onepanelServiceType: null,

  /**
   * To inject.
   * @type {ClusterInfo}
   */
  clusterInfo: null,

  /**
   * @type {InstallationStep}
   */
  initStep: InstallationStepsMap.deploy,

  /**
   * @type {string|null}
   */
  name: null,

  /**
   * @type {boolean}
   * @virtual
   */
  hasCephDeployed: false,

  type: reads('content.onepanelServiceType'),

  init() {
    this._super(...arguments);
    // TODO i18n or set default name in some view
    if (this.get('name') == null) {
      this.set('name', 'New cluster');
    }
  },

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isInitialized: reads('initStep.isFinalStep'),
});
