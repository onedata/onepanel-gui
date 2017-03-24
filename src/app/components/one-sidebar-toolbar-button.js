import Ember from 'ember';

const {
  computed: {
    readOnly
  }
} = Ember;

export default Ember.Component.extend({
  classNames: ['one-sidebar-toolbar-button'],

  buttonModel: null,

  title: readOnly('buttonModel.title'),
  icon: readOnly('buttonModel.icon'),
  action: readOnly('buttonModel.action'),
});
