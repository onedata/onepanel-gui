/**
 * OneS3 port settings for cluster hosts configuration.
 *
 * Must be fed by with some external information about modification state of cluster hosts
 * editor.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { action, computed } from '@ember/object';
import Component from '@glimmer/component';
import Locale from 'onedata-gui-common/utils/locale';
import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
import { htmlSafe } from '@ember/string';

/** @import OneS3ClusterValidator from '../../utils/one-s3-cluster-validator' **/
/** @import { ClusterHostTableMode } from '../cluster-host-table' */

/**
 * @typedef {Object} OneS3PortSignature
 * @property {HTMLDivElement} Element
 * @property {OneS3PortArgs} Args
 */

/**
 * @typedef {Object} OneS3PortArgs
 * @property {Array<ClusterHostInfo>} currentHosts Current state of cluster hosts table.
 * @property {Array<ClusterHostInfo>} initialHosts Initial state of cluster hosts table
 *   for comparison with the current state. This state should be set on the load/save and
 *   should stay unmodified when user can edit hosts.
 * @property {ClusterHostTableMode} tableMode
 * @property {string} portValue Current string value in the input.
 * @property {OneS3ClusterValidator} validator External validator is needed to cooperate
 *   with parent components in field of hosts validation.
 * @property {boolean} isPortValueModified Should be set to true by external context if
 *   user changed the port value between save/load.
 * @property {(portValue: string) => void} onChange Updates string port value of the
 *   context.
 */

/** @enum */
const OneS3PortState = Object.freeze({
  None: 'None',
  ExistingEditing: 'ExistingEditing',
  ExistingShowing: 'ExistingShowing',
  AutoColliding: 'AutoColliding',
  AutoDefault: 'AutoDefault',
  CustomValid: 'CustomValid',
  CustomInvalid: 'CustomInvalid',
});

/**
 * @extends {Component<OneS3PortSignature>}
 */
export default class ClusterHostTableOneS3PortComponent extends Component {
  locale = new Locale('components.clusterHostTable.oneS3Port');

  /** @type {OneS3PortState} */
  @computed(
    'wasDeployed',
    'tableMode',
    'willAddNewOneS3',
    'isPortValueModified',
    'valid',
    'someHostHasConflict',
  )
  get currentState() {
    if (this.wasDeployed) {
      return this.tableMode === 'show' ?
        OneS3PortState.ExistingShowing : OneS3PortState.ExistingEditing;
    }
    if (this.willAddNewOneS3) {
      if (!this.valid) {
        return OneS3PortState.CustomInvalid;
      }
      if (!this.isPortValueModified) {
        return this.someHostHasConflict ?
          OneS3PortState.AutoColliding : OneS3PortState.AutoDefault;
      }
      return OneS3PortState.CustomValid;
    }
    return OneS3PortState.None;
  }

  @computed('args.portValue')
  get portValue() {
    return this.args.portValue;
  }

  @computed('args.tableMode')
  get tableMode() {
    return this.args.tableMode;
  }

  @computed('args.validator')
  get validator() {
    return this.args.validator;
  }

  @computed('args.currentHosts')
  get currentHosts() {
    return this.args.currentHosts;
  }

  @computed('args.initialHosts', 'currentHosts')
  get initialHosts() {
    return this.args.initialHosts ??
      // Fallback to hosts without any service enabled (eg. for create mode).
      this.currentHosts.map(currentHostInfo => ClusterHostInfo.create({
        hostname: currentHostInfo.hostname,
        database: false,
        clusterWorker: false,
        clusterManager: false,
        oneS3: false,
      }));
  }

  @computed('args.isPortValueModified')
  get isPortValueModified() {
    return this.args.isPortValueModified;
  }

  @computed('currentHosts.@each.oneS3', 'initialHosts')
  get willAddNewOneS3() {
    for (let i = 0; i < this.currentHosts.length; ++i) {
      if (this.currentHosts[i].oneS3 && !this.initialHosts[i].oneS3) {
        return true;
      }
    }
    return false;
  }

  @computed('initialHosts.@each.oneS3')
  get wasDeployed() {
    return this.initialHosts?.some(hostInfo => hostInfo.oneS3) ?? false;
  }

  @computed('currentState')
  get isShown() {
    return this.currentState !== OneS3PortState.None;
  }

  @computed('currentState')
  get usesInput() {
    return ![
      OneS3PortState.ExistingShowing,
      OneS3PortState.None,
    ].includes(this.currentState);
  }

  @computed('currentState')
  get portLocked() {
    return this.currentState === OneS3PortState.ExistingEditing;
  }

  @computed('currentState')
  get feedbackIcon() {
    switch (this.currentState) {
      case OneS3PortState.Invalid:
        return 'checkbox-filled-warning';
      default:
        return 'browser-info';
    }
  }

  @computed('validator.isValid')
  get valid() {
    return this.validator.isValid;
  }

  @computed(
    'currentState',
    'validator.errorText',
  )
  get iconTooltip() {
    switch (this.currentState) {
      case OneS3PortState.ExistingShowing:
        return this.getTipText('intro');
      case OneS3PortState.ExistingEditing:
        return this.getTipText('intro', 'setOnlyOnce');
      case OneS3PortState.AutoColliding:
        return this.getTipText('intro', 'autoColliding', 'setOnlyOnce');
      case OneS3PortState.AutoDefault:
        return this.getTipText('intro', 'setToRecommended', 'setOnlyOnce');
      case OneS3PortState.CustomValid:
        return this.getTipText('intro', 'setOnlyOnce');
      case OneS3PortState.CustomInvalid:
        return this.getTipText(
          'intro', { invalidReason: this.validator.errorText },
          'setOnlyOnce',
        );
      default:
        return this.getTipText('intro');
    }
  }

  @computed('currentHosts.@each.{clusterWorker,oneS3}')
  get someHostHasConflict() {
    return this.currentHosts.some(hostInfo => hostInfo.clusterWorker && hostInfo.oneS3);
  }

  /**
   * @param {...any} tipKeys
   * @returns {SafeString}
   */
  getTipText(...tipKeys) {
    let result = '';
    for (const key of tipKeys) {
      if (typeof key === 'string') {
        result += `<p>${this.locale.t(`tip.${key}`)}</p>`;
      } else if (key?.invalidReason) {
        result += `<p>${this.locale.t('tip.isInvalid', { reason: key.invalidReason })}</p>`;
      }
    }
    return htmlSafe(result);
  }

  /**
   * @param {InputEvent} event
   */
  @action changePort(event) {
    this.args.onChange(event.target.value);
  }
}
