import {
  InvokeActionMixin
} from 'ember-invoke-action';
import BasicTable from './basic-table';

// TODO: validation TODO: is setting first options for some host, set this host
// as a primary cluster manager
export default BasicTable.extend(InvokeActionMixin, {
  tagName: 'table',
  classNames: ['cluster-host-table', 'table', 'table-striped', 'dropdown'],

  hosts: null,
  primaryClusterManager: null,

  actions: {
    checkboxChanged(hostname, option, newValue) {
      this.invokeAction('hostOptionChanged', hostname, option, newValue);
    },

    primaryClusterManagerChanged(hostname) {
      this.invokeAction('primaryClusterManagerChanged', hostname);
    },
  }
});
