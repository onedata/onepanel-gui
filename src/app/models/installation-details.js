/**
 * Information about installation of cluster
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ObjectProxy from '@ember/object/proxy';
import { get, set } from '@ember/object';
import { alias, reads } from '@ember/object/computed';
import InstallationStep from 'onepanel-gui/utils/installation-step';

export const installationStepsArray = Object.freeze([
  InstallationStep.create({
    name: 'deploy',
  }),
  InstallationStep.create({
    name: 'deploymentProgress',
    isHiddenStep: true,
  }),
  InstallationStep.create({
    name: 'oneproviderRegistration',
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

installationStepsArray
  .forEach(step => set(step, 'stepsOrder', installationStepsArray));

export const installationStepsMap = Object.freeze(
  installationStepsArray.reduce((map, step) => {
    map[get(step, 'name')] = step;
    return map;
  }, {})
);

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
  initStep: installationStepsMap.deploy,

  /**
   * @type {string|null}
   */
  name: null,

  type: reads('content.onepanelServiceType'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isInitialized: reads('initStep.isFinalStep'),
});
