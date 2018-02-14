import { readOnly } from '@ember/object/computed';
import { observer, computed } from '@ember/object';
import {
  InvokeActionMixin,
} from 'ember-invoke-action';
import BasicTable from 'onedata-gui-common/components/basic-table';

import { validator, buildValidations } from 'ember-cp-validations';

const roles = ['database', 'clusterWorker', 'clusterManager'];

function hostColumnPropertyName(role) {
  return `${role}Hosts`;
}

function hostColumnComputedProperties(roles) {
  let columnLists = {};
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
  let columnValidations = {};
  roleColumns.forEach(col => {
    columnValidations[col] = validator('length', { min: 1 });
  });
  columnValidations['primaryClusterManager'] = validator('presence', true);
  return columnValidations;
}

let Validations = buildValidations(generateColumnValidations(roles));

// TODO: validation TODO: is setting first options for some host, set this host
// as a primary cluster manager

/**
 * Renders a table in which roles can be set to hosts for cluster deployment 
 *
 * Invokes passed actions:
 * - hostOptionChanged(hostname: string, option: string, value: boolean)
 * - primaryClusterManagerChanged(hostname: string, isSet: boolean)
 *
 * @module components/cluster-host-table
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default BasicTable.extend(
  InvokeActionMixin,
  hostColumnComputedProperties(roles),
  Validations, {
    tagName: 'table',
    classNames: ['cluster-host-table', 'table', 'table-striped', 'dropdown-table-rows'],

    /**
     * To inject.
     * @type {Array.ClusterHostInfo}
     */
    hosts: null,

    /**
     * If true, do not allow to edit cluster
     * @type {boolean}
     */
    isReadOnly: false,

    primaryClusterManager: null,

    allValid: readOnly('validations.isValid'),
    // TODO make/use valid properties for each column
    // databaseHostsValid: computed.readOnly('validations.attrs.databaseHosts.isValid'),

    tableValidChanged: observer('allValid', function () {
      this.invokeAction('allValidChanged', this.get('allValid') === true);
    }),

    init() {
      this._super(...arguments);
      this.tableValidChanged();
    },

    actions: {
      checkboxChanged(hostname, option, newValue) {
        this.invokeAction('hostOptionChanged', hostname, option, newValue);
      },

      primaryClusterManagerChanged(hostname, isSet) {
        this.invokeAction('primaryClusterManagerChanged', isSet ? hostname : null);
      },
    },
  }
);
