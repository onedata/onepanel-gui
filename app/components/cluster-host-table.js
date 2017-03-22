import Ember from 'ember';
import {
  InvokeActionMixin
} from 'ember-invoke-action';

import { validator, buildValidations } from 'ember-cp-validations';

const {
  computed,
  observer,
} = Ember;

function roleHosts(role) {
  return `${role}Hosts`;
}

const roles = ['database', 'clusterWorker', 'clusterManager'];
const roleColumns = roles.map(roleHosts);

const columnLists = {};
roles.forEach(role => {
  columnLists[roleHosts(role)] = computed(`hosts.@each.${role}`, function () {
    return this.get('hosts').filter(h => h[role]);
  });
});

const columnValidations = {};
roleColumns.forEach(col => {
  columnValidations[col] = validator('length', { min: 1 });
});

columnValidations['primaryClusterManager'] = validator('presence', true);

let Validations = buildValidations(columnValidations);

// TODO: validation TODO: is setting first options for some host, set this host
// as a primary cluster manager
const ClusterHostTable = Ember.Component.extend(Validations, InvokeActionMixin, {
  tagName: 'table',
  classNames: ['cluster-host-table', 'table', 'table-striped'],

  hosts: null,
  primaryClusterManager: null,

  allValid: computed.readOnly('validations.isValid'),
  // TODO make/use valid properties for each column
  // databaseHostsValid: computed.readOnly('validations.attrs.databaseHosts.isValid'),

  tableValidChanged: observer('allValid', function () {
    this.invokeAction('allValidChanged', !!this.get('allValid'));
  }),

  init() {
    this._super(...arguments);
    this.tableValidChanged();
  },

  actions: {
    checkboxChanged(hostname, option, newValue) {
      this.invokeAction('hostOptionChanged', hostname, option, newValue);
    },

    primaryClusterManagerChanged(hostname) {
      this.invokeAction('primaryClusterManagerChanged', hostname);
    },
  }
});

export default ClusterHostTable.extend(columnLists);
