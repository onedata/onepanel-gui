// FIXME: jsdoc

import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Locale from 'onedata-gui-common/utils/locale';

/** @import { ClusterHostInfo } from '../models/cluster-host-info' */

/**
 * @typedef {'conflictingPort'|'invalidNumber'|'empty'} OneS3PortErrorKey
 */

export default class OneS3ClusterValidator {
  locale = new Locale('utils.oneS3ClusterValidator');

  /** @type {Array<ClusterHostInfo>} */
  @tracked
  hosts;

  /** @type {string} */
  @tracked
  portValue;

  /**
   * Using computed because each ClusterHostInfo of this.hosts is EmberModel.
   * @type {boolean}
   */
  @computed('portValue', 'hosts.@each.{clusterWorker,oneS3}')
  get portConflicting() {
    return Number(this.portValue) === 443 &&
      this.hosts.some(hostInfo => hostInfo.clusterWorker && hostInfo.oneS3);
  }

  @computed('errorKey')
  get isValid() {
    return !this.errorKey;
  }

  /** @type {OneS3PortErrorKey|null}} */
  @computed('portConflicting', 'portValue')
  get errorKey() {
    if (!this.portValue && this.portValue !== 0) {
      return 'empty';
    }
    if (this.portConflicting) {
      return 'conflictingPort';
    }
    const portNumber = parseInt(this.portValue);
    if (!/^\s*\d+\s*$/.test(this.portValue) || portNumber < 0 || portNumber > 65535) {
      return 'invalidNumber';
    }
    return null;
  }

  @computed('errorKey')
  get errorText() {
    const key = this.errorKey;
    return key ? this.locale.t(`errors.${key}`) : null;
  }
}
