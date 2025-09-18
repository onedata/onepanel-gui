/**
 * FIXME:
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import Locale from 'onedata-gui-common/utils/locale';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import { tracked } from '@glimmer/tracking';
import getTaskId from 'ember-onedata-onepanel-server/utils/get-task-id';

/**
 * @typedef {Object} EnableS3ModalSignature
 * @property {EnableS3ModalArgs} Args
 */

/**
 * @typedef {Object} EnableS3ModalArgs
 * @property {EnableS3ModalOptions} modalOptions
 * @property {string} modalId
 */

/**
 * @typedef {Object} EnableS3ModalOptions
 * @property {Array<string>} hostnames
 * @property {() => void} onSuccess
 * @property {() => void} onFailure
 * @property {string} [modalClass]
 */

/**
 * @readonly
 * @enum {string}
 */
const EnableS3ModalState = Object.freeze({
  Confirm: 'confirm',
  Progress: 'progress',
});

/**
 * @typedef {Object} S3DeploymentTaskStatus
 * @property {Array<S3DeploymentStep>} steps
 * @property {'ok'|'error'|'running'} status
 * @property {number} totalSteps
 * @property {Object} [error]
 */

function getStateClasses() {
  return {
    [EnableS3ModalState.Confirm]: EnableS3ModalConfirmState,
    [EnableS3ModalState.Progress]: EnableS3ModalProgressState,
  };
}

/**
 * @readonly
 * @enum
 */
export const S3DeploymentStep = Object.freeze({
  OneS3CreateService: 'service_ones3:create_service',
  OneS3AddServiceHost: 'service_ones3:add_service_host',
  OneproviderSetClusterIps: 'service_oneprovider:set_cluster_ips',
  OnepanelSetMarker: 'onepanel_deployment:set_marker',
  OneS3Configure: 'service_ones3:configure',
  OneproviderStart: 'service_ones3:start',
  OneproviderWaitForInit: 'service_ones3:wait_for_init',
  LetsEncryptDisable: 'service_letsencrypt:disable',
});

/**
 * @param {S3DeploymentStep} stepId
 * @returns {keyof<S3DeploymentStep>}
 */
function getDeploymentEnumKey(stepId) {
  if (!stepId) {
    return undefined;
  }
  for (const [key, value] of Object.entries(S3DeploymentStep)) {
    if (value === stepId) {
      return key;
    }
  }
}

/**
 * @extends {Component<EnableS3ModalSignature>}
 */
export default class EnableS3ModalComponent extends Component {
  @service
  onepanelServer;

  @service
  globalNotify;

  locale = new Locale('components.modals.enableS3Modal');

  EnableS3ModalState = EnableS3ModalState;

  constructor() {
    super(...arguments);
    this.setState(EnableS3ModalState.Confirm);
  }

  /**
   * @type {jQuery.Promise}
   */
  deployProgressPromise = null;

  @tracked
  currentState = null;

  get modalOptions() {
    return this.args.modalOptions;
  }

  get modalId() {
    return this.args.modalId;
  }

  get modalClass() {
    return this.modalOptions.modalClass;
  }

  get hostnames() {
    return this.modalOptions.hostnames;
  }

  get onSuccess() {
    return this.modalOptions.onSuccess;
  }

  get onFailure() {
    return this.modalOptions.onFailure;
  }

  /** @type {EnableS3ModalState} */
  get stateName() {
    return this.currentState.stateName;
  }

  get introText() {
    return this.currentState.introText;
  }

  /**
   * @param {EnableS3ModalState} stateName
   * @param {Object} context Passed as a second argument to State constructor.
   */
  setState(stateName, context) {
    const StateClass = getStateClasses()[stateName];
    this.currentState = new StateClass(this, context);
  }

  @action
  startDeployment() {
    return this.currentState.startDeployment?.();
  }
}

class EnableS3ModalConfirmState {
  /**
   * @param {EnableS3ModalComponent} component
   */
  constructor(component) {
    this.component = component;
  }

  get locale() {
    return this.component.locale;
  }

  get stateName() {
    return EnableS3ModalState.Confirm;
  }

  get isDeployDisabled() {
    return false;
  }

  get isCancelDisabled() {
    return false;
  }

  get introText() {
    return this.locale.t(
      `body.intro.${this.component.hostnames.length === 1 ? 'singular' : 'plural'}`
    );
  }

  /**
   * @param {number} [port]
   * @returns {Promise<string>} Task ID of OneS3 deployment process.
   */
  async deployOneS3(port) {
    if (this.isDeployDisabled) {
      return;
    }

    /** @type {Onepanel.ServiceOnes3} */
    const options = {
      hosts: this.component.hostnames,
    };
    if (typeof port === 'number') {
      options.port = port;
    }
    const { response } = await this.component.onepanelServer.request(
      'OneproviderClusterApi',
      'addOnes3',
      options
    );
    return getTaskId(response);
  }

  @action
  async startDeployment() {
    try {
      const deploymentTaskId = await this.deployOneS3();
      this.component.setState(EnableS3ModalState.Progress, { deploymentTaskId });
    } catch (error) {
      this.component.globalNotify.backendError(
        this.component.locale.t('startingDeployment'),
        error
      );
    }
  }
}

class EnableS3ModalProgressState {
  /**
   * @param {EnableS3ModalComponent} component
   * @param {Object} context
   */
  constructor(component, context) {
    this.component = component;
    const taskId = context.deploymentTaskId;
    if (taskId) {
      this.initProgress(taskId);
    } else {
      this.handleStatusCheckError({
        message: this.locale.t('noTaskId'),
      });
    }
  }

  get locale() {
    return this.component.locale;
  }

  /**
   * Names of steps that have been done plus current step of deployment.
   * @type {Array<S3DeploymentStep>}
   */
  @tracked
  stepsDoneAndCurrent = [];

  /**
   * Number of total claimed deployment steps.
   * @type {number}
   */
  @tracked
  totalStepsCount = 0;

  get stateName() {
    return EnableS3ModalState.Progress;
  }

  get onepanelServer() {
    return this.component.onepanelServer;
  }

  get isDeployDisabled() {
    return true;
  }

  get isCancelDisabled() {
    return true;
  }

  /** @type {S3DeploymentStep} */
  get currentStepId() {
    return this.stepsDoneAndCurrent.at(-1);
  }

  /** @type {SafeString} */
  get stepText() {
    if (!this.currentStepId) {
      return this.locale.t('unknownStep');
    }
    const stepTranslation = this.locale.t(
      `steps.${getDeploymentEnumKey(this.currentStepId)}`, {}, { defaultValue: '' }
    );
    return stepTranslation || this.currentStepId;
  }

  /**
   * A float number from 0 to 1 representing percentage done of deployment process.
   * @type {number}
   */
  get deployProgress() {
    if (!this.totalStepsCount) {
      return 0;
    }
    return Math.min(this.stepsDoneAndCurrent.length / this.totalStepsCount, 1);
  }

  /**
   * @param {string} deploymentTaskId
   */
  initProgress(deploymentTaskId) {
    const deployProgressPromise = watchTaskStatus(
      this.onepanelServer,
      deploymentTaskId,
      500
    );
    this.registerDeployProgress(deployProgressPromise);
  }

  /**
   * @param {jQuery.Promise} deployProgressPromise
   */
  registerDeployProgress(deployProgressPromise) {
    this.deployProgressPromise = deployProgressPromise;
    deployProgressPromise.progress(this.handleDeployProgress.bind(this));
    deployProgressPromise.done(this.handleDeployFinish.bind(this));
    deployProgressPromise.fail(this.handleStatusCheckError.bind(this));
  }

  /**
   * @param {S3DeploymentTaskStatus} taskStatus
   */
  handleDeployProgress(taskStatus) {
    if (this.totalStepsCount !== taskStatus.totalSteps) {
      this.totalStepsCount = taskStatus.totalSteps;
    }
    this.stepsDoneAndCurrent = taskStatus.steps;
  }

  /**
   * @param {S3DeploymentTaskStatus} taskStatus
   */
  handleDeployFinish(taskStatus) {
    this.handleDeployProgress(taskStatus);
    if (taskStatus.status === 'ok') {
      this.component.onSuccess();
    } else {
      this.component.onFailure(taskStatus.error);
    }
  }

  /**
   * @param {any} error
   */
  handleStatusCheckError(error) {
    this.component.onFailure(error);
  }
}
