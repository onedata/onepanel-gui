/**
 * Table with cluster hosts
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2023 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { readOnly } from '@ember/object/computed';
import { observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { eq, raw } from 'ember-awesome-macros';
import BasicTable from 'onedata-gui-common/components/basic-table';
import I18n from 'onedata-gui-common/mixins/i18n';
import { validator, buildValidations } from 'ember-cp-validations';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import { scheduleOnce } from '@ember/runloop';

const requiredRoles = ['database', 'clusterWorker', 'clusterManager'];

function hostColumnPropertyName(role) {
  return `${role}Hosts`;
}

function hostColumnComputedProperties(roles) {
  const columnLists = {};
  roles.forEach(role => {
    columnLists[hostColumnPropertyName(role)] = computed(
      `hosts.@each.${role}`,
      function () {
        return this.get('hosts').filter(h => h[role]);
      }
    );
  });
  return columnLists;
}

function generateColumnValidations(roles) {
  const roleColumns = roles.map(hostColumnPropertyName);
  const columnValidations = {};
  roleColumns.forEach(col => {
    columnValidations[col] = validator('length', { min: 1 });
  });
  columnValidations['primaryClusterManager'] = validator('presence', true);
  return columnValidations;
}

const Validations = buildValidations(generateColumnValidations(requiredRoles));

// TODO: validation TODO: is setting first options for some host, set this host
// as a primary cluster manager

/**
 * @typedef {'create'|'edit'|'show'} ClusterHostTableMode
 */

/**
 * Maps hostname to object with info about readonly toggles for table row in cluster host
 * table.
 * @typedef {Object<string, ClusterHostTableRowReadonlyServices>} ClusterHostTableReadonlyServices
 */

/**
 * Renders a table in which roles can be set to hosts for cluster deployment
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default BasicTable.extend(
  I18n,
  hostColumnComputedProperties(requiredRoles),
  Validations, {
    tagName: 'table',
    classNames: ['cluster-host-table', 'table', 'table-striped', 'dropdown-table-rows'],

    guiUtils: service(),

    i18nPrefix: 'components.clusterHostTable',

    /**
     * @virtual optional
     * @type {(hostname: string, option: string, value: boolean) => void}
     */
    hostOptionChanged: undefined,

    /**
     * @virtual optional
     * @type {(hostname: string|null) => void}
     */
    primaryClusterManagerChanged: undefined,

    /**
     * @virtual optional
     * @type {(isValid: boolean) => void}
     */
    allValidChanged: undefined,

    /**
     * @virtual optional
     * @type {ClusterHostTableReadonlyServices}
     */
    readonlyServicesHosts: undefined,

    /**
     * @virtual optional
     */
    removeHost: notImplementedReject,

    /**
     * To inject.
     * @type {Array<ClusterHostInfo>}
     */
    hosts: null,

    /**
     * @type {ClusterHostTableMode}
     */
    mode: 'create',

    /**
     * If true, do not allow to edit cluster
     * @type {boolean}
     */
    isReadOnly: false,

    primaryClusterManager: null,

    /**
     * These host entries will blink to indicate some action
     * @type {Array<ClusterHostInfo>}
     */
    blinkingHosts: Object.freeze([]),

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    onepanelServiceType: readOnly('guiUtils.serviceType'),

    /**
     * @type {ComputedProperty<boolean>}
     */
    isOneS3Visible: eq('onepanelServiceType', raw('oneprovider')),

    allValid: readOnly('validations.isValid'),
    // TODO make/use valid properties for each column
    // databaseHostsValid: computed.readOnly('validations.attrs.databaseHosts.isValid'),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    removeHostAvailable: computed('removeHost', function () {
      return this.get('removeHost') !== notImplementedReject;
    }),

    hostsRowData: computed(
      'hosts.@each.hostname',
      'blinkingHosts.[]',
      'readonlyServicesHosts',
      'primaryClusterManager',
      function hostsRowData() {
        return this.hosts.map(hostInfo => ({
          hostInfo,
          isPrimaryClusterManager: this.primaryClusterManager === hostInfo.hostname,
          readonlyServices: this.readonlyServicesHosts?.[hostInfo.hostname],
          isBlinking: this.blinkingHosts.includes(hostInfo),
        }));
      }
    ),

    tableValidChanged: observer('allValid', function () {
      const {
        allValidChanged,
        allValid,
      } = this.getProperties('allValidChanged', 'allValid');
      if (allValidChanged) {
        allValidChanged(allValid === true);
      }
    }),

    hostsChanged: observer('hosts.[]', function () {
      scheduleOnce('afterRender', this, '_reinitializeBasictable');
    }),

    init() {
      this._super(...arguments);
      this.tableValidChanged();

      // enable observers
      this.get('hosts.[]');
    },

    actions: {
      checkboxChanged(hostname, option, newValue) {
        const hostOptionChanged = this.get('hostOptionChanged');
        if (hostOptionChanged) {
          hostOptionChanged(hostname, option, newValue);
        }
      },

      primaryClusterManagerChanged(hostname, isSet) {
        const primaryClusterManagerChanged = this.get('primaryClusterManagerChanged');
        if (primaryClusterManagerChanged) {
          primaryClusterManagerChanged(isSet ? hostname : null);
        }
      },

      removeHost(hostname) {
        return this.get('removeHost')(hostname);
      },
    },
  }
);
