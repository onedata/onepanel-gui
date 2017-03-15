import Ember from 'ember';
import {
  InvokeActionMixin
} from 'ember-invoke-action';

export default Ember.Component.extend(InvokeActionMixin, {
  tagName: 'tr',
  classNames: 'cluster-host-table-row',

  actions: {
    checkboxChanged() {
      this.invokeAction('checkboxChanged', ...arguments);
    },
    primaryClusterManagerChanged() {
      this.invokeAction('primaryClusterManagerChanged', ...arguments);
    }
  }
});
