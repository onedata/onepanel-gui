/**
 * Shows status of cluster deployment process
 *
 * @module components/new-cluster-deploy-progress
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { observer, computed, getProperties, get } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { KNOWN_STEPS } from 'ember-onedata-onepanel-server/utils/cluster-deploy-steps';

const RE_STEP = /service_?(.*):(.*)/;

// TODO this can be made a generic taskStatus progress component
export default Component.extend(I18n, {
  classNames: ['new-cluster-deploy-progress'],

  i18n: service(),
  guiUtils: service(),
  onepanelServer: service(),

  i18nPrefix: 'components.newClusterDeployProgress',
  
  /**
   * Promise for watching deployment process.
   * @type {jQuery.Promise}
   */
  deploymentPromise: null,

  /**
   * Set by task status updates
   * @type {Array<string>}
   */
  doneSteps: Object.freeze([]),

  /**
   * Initialized by task status updates
   * @type {number}
   */
  totalStepsNumber: 1,

  /**
   * Is set to true if deployement process has finished.
   * @type {boolean}
   */
  isDone: false,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  onepanelServiceType: reads('guiUtils.serviceType'),

  /**
   * Actual step
   * @type {Ember.ComputedProperty<string>}
   */
  step: reads('doneSteps.lastObject'),

  /**
   * Translated step description
   * @type {Ember.ComputedProperty<string>}
   */
  stepText: computed('step', function stepText() {
    const step = this.get('step');
    if (step) {
      const [, service, action] = RE_STEP.exec(step);
      if (_.includes(KNOWN_STEPS, step)) {
        const tservice = service ? this.t(`steps.service.${service}`) : '';
        return this.t(`steps.action.${action}`, { service: tservice });
      } else {
        return step;
      }
    } else {
      return this.t('steps.unknown');
    }
  }),

  /**
   * A progress in range 0..1 for progress bar.
   * @type {Ember.ComputedProperty<number>}
   */
  progress: computed(
    'doneSteps',
    'isDone',
    'totalStepsNumber',
    function progress() {
      const {
        isDone,
        doneSteps,
        totalStepsNumber,
      } = this.getProperties('isDone', 'doneSteps', 'totalStepsNumber');
      if (isDone) {
        return 1;
      } else {
        return get(doneSteps, 'length') / totalStepsNumber;
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.bindDeploymentEvents();
  },

  /**
   * Add callbacks for deployment promise.
   */
  bindDeploymentEvents: observer(
    'deploymentPromise',
    function bindDeploymentEvents() {
      const deploymentPromise = this.get('deploymentPromise');
      if (deploymentPromise) {
        deploymentPromise.progress(taskStatus => {
          safeExec(this, () => this.handleProgress(taskStatus));
        });
        deploymentPromise.done(taskStatus => {
          safeExec(this, () => this.handleDone(taskStatus));
        });
      }
    }
  ),

  /**
   * Use `TaskStatus` from deployment promise progress callback. 
   * @param {Onepanel.TaskStatus} taskStatus
   * @returns {undefined}
   */
  handleProgress(taskStatus) {
    let {
      steps: doneSteps,
      totalSteps: totalStepsNumber,
    } = getProperties(taskStatus, 'steps', 'totalSteps');

    // If error occurred while calculating number of steps then it is possible
    // that field totalSteps is empty. In that case we need a fallback value
    // that will not break down progress calculations.
    if (!totalStepsNumber) {
      totalStepsNumber = 1;
    }

    this.setProperties({
      doneSteps,
      totalStepsNumber,
    });
  },

  /**
   * Handle done event of deployment promise.
   * @returns {undefined}
   */
  handleDone() {
    this.set('isDone', true);
  },
});
