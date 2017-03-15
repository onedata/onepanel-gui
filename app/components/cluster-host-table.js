import Ember from 'ember';
import {
  InvokeActionMixin
} from 'ember-invoke-action';

// TODO: validation TODO: is setting first options for some host, set this host
// as a primary cluster manager
export default Ember.Component.extend(InvokeActionMixin, {
  tagName: 'table',
  classNames: ['cluster-host-table', 'table', 'table-striped'],

  hosts: null,
  primaryClusterManager: null,

  actions: {
    checkboxChanged(checked, event) {
      let checkbox = event.currentTarget;
      let hostname = checkbox.getAttribute('data-hostname');
      let option = checkbox.getAttribute('data-option');

      this.invokeAction('hostOptionChanged', hostname, option, checked);
    },

    primaryClusterManagerChanged(hostname) {
      this.invokeAction('primaryClusterManagerChanged', hostname);
    },
  }
});
