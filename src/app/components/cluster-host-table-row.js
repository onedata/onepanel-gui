import Ember from 'ember';
import {
  InvokeActionMixin
} from 'ember-invoke-action';

export default Ember.Component.extend(InvokeActionMixin, {
  tagName: 'tr',
  classNames: 'cluster-host-table-row',
  classNameBindings: ['active'],
  active: false,

  actions: {
    headerClick() {
      this.toggleProperty('active');
    },
    checkboxChanged(
      newValue,
      context
    ) {
      let hostname = context.get('hostHostname');
      let option = context.get('hostOption');
      this.invokeAction('checkboxChanged', hostname, option, newValue);
    },
    primaryClusterManagerChanged() {
      this.invokeAction('primaryClusterManagerChanged', ...arguments);
    }
  }
});
