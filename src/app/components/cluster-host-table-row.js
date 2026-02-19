/**
 * Single row of cluster hosts table
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { computed, get } from '@ember/object';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';

/**
 * @typedef {'database'|'clusterWorker'|'clusterManager'|'primaryClusterManager'|'oneS3'} ClusterHostTableToggleId
 */

/**
 * Maps: name of service/role (toggle ID) -> boolean if toggle is readonly or the tooltip
 * for readonliness.
 * @typedef {Object<ClusterHostTableToggleId, boolean|SafeString>} ClusterHostTableRowReadonlyServices
 */

export default Component.extend(I18n, {
  tagName: 'tr',
  classNames: ['cluster-host-table-row', 'animated', 'infinite'],
  classNameBindings: ['active', 'blinking:pulse-bg-mint'],
  attributeBindings: ['dataHostname:data-hostname'],

  /** @override */
  i18nPrefix: 'components.clusterHostTableRow',

  onepanelServer: service(),

  /**
   * @virtual
   * @type {ClusterHostInfo}
   */
  host: undefined,

  /**
   * @virtual
   * @type {ClusterHostTableMode}
   */
  mode: 'create',

  /**
   * @virtual
   * @type {boolean}
   */
  isPrimaryClusterManager: false,

  /**
   * @virtual
   * @type {boolean}
   */
  isOneS3Visible: false,

  /**
   * @virtual
   * @type {Function}
   */
  checkboxChanged: notImplementedWarn,

  /**
   * @virtual
   * @type {Function} (hostname: string) => Promise
   */
  removeHost: notImplementedReject,

  /**
   * @virtual
   * @type {boolean}
   */
  isMobile: undefined,

  /**
   * Custom readonly service toggles mapping if the default one (computed in
   * createReadOnlyState) is not properly fitted.
   * @virtual
   * @type {ClusterHostTableRowReadonlyServices}
   */
  readonlyServices: undefined,

  /**
   * @virtual optional
   */
  removeAvailable: computed('removeHost', {
    get() {
      return this.injectedRemoveAvailable ?? this.removeHost !== notImplementedReject;
    },
    set(key, value) {
      return this.injectedRemoveAvailable = value;
    },
  }),

  /**
   * @type {boolean}
   */
  active: false,

  /**
   * @type {boolean}
   */
  blinking: false,

  /**
   * @type {ClusterHostInfo}
   */
  dataHostname: alias('host.hostname'),

  /**
   * @type {boolean | null}
   */
  injectedRemoveAvailable: null,

  /**
   * @type {boolean}
   */
  _removeDisabled: false,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isRemoveHostBtnDisabled: computed(
    'isThisHost.{isSettled,content}',
    function isRemoveHostBtnDisabled() {
      const isThisHost = this.get('isThisHost');
      if (get(isThisHost, 'isSettled')) {
        if (get(isThisHost, 'isRejected')) {
          return true;
        } else {
          return Boolean(get(isThisHost, 'content'));
        }
      } else {
        return true;
      }
    }
  ),

  /**
   * True if this row represents current host
   * @type {Ember.ComputedProperty<Promise<boolean>>}
   */
  isThisHost: computed('onepanelServer.nodeProxy', 'dataHostname', function () {
    const {
      onepanelServer,
      dataHostname,
    } = this.getProperties('onepanelServer', 'dataHostname');
    return PromiseObject.create({
      promise: onepanelServer.getNodeProxy()
        .then(({ hostname }) => hostname)
        .then(hostname => hostname === dataHostname),
    });
  }),

  effReadonlyServices: computed(
    'readonlyServices',
    'mode',
    function effReadonlyServices() {
      return this.readonlyServices ?? this.createReadOnlyState(this.mode);
    }
  ),

  togglesLockTooltip: computed('effReadonlyServices', function togglesLockTooltip() {
    const tooltips = {};
    for (const [service, readonliness] of Object.entries(this.effReadonlyServices)) {
      if (readonliness && typeof readonliness !== 'boolean') {
        // this is probably a tip
        tooltips[service] = readonliness;
      }
    }
    return tooltips;
  }),

  /**
   * Creates default disabled toggles mapping for table row.
   * @param {ClusterHostTableMode} mode
   * @returns {ClusterHostTableRowReadonlyServices}
   */
  createReadOnlyState(mode) {
    const isCreating = mode === 'create';
    return {
      database: !isCreating,
      clusterWorker: !isCreating,
      clusterManager: !isCreating,
      primaryClusterManager: !isCreating,
      oneS3: mode === 'show' ||
        // Gets state of oneS3 toggle only on mode change, because we want to be able to
        // rollback to disabled state in single edit.
        mode === 'edit' && this.host.oneS3,
    };
  },

  actions: {
    headerClick() {
      this.toggleProperty('active');
    },
    checkboxChanged(
      newValue,
      context
    ) {
      const hostname = context.get('hostHostname');
      const option = context.get('hostOption');
      this.get('checkboxChanged')(hostname, option, newValue);
    },
    primaryClusterManagerChanged() {
      this.get('primaryClusterManagerChanged')(...arguments);
    },
    removeHost() {
      const {
        removeHost,
        dataHostname,
      } = this.getProperties('removeHost', 'dataHostname');
      this.set('_removeDisabled', true);
      return removeHost(dataHostname)
        .finally(() => safeExec(this, 'set', '_removeDisabled', false));
    },
  },
});
