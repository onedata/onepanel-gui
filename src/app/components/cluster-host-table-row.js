import Ember from 'ember';
import {
  InvokeActionMixin
} from 'ember-invoke-action';

const {
  computed: { alias },
} = Ember;

export default Ember.Component.extend(InvokeActionMixin, {
  tagName: 'tr',
  classNames: 'cluster-host-table-row',
  classNameBindings: ['active'],
  attributeBindings: ['dataHostname:data-hostname'],

  /**
   * @type {boolean}
   */
  active: false,

  // TODO security - check if cannot make HTML injection using hostname
  /**
   * @type {ClusterHostInfo}
   */
  dataHostname: alias('host.hostname'),

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
