import Ember from 'ember';

const {
  Component,
  assert,
  computed: {
    alias
  }
} = Ember;

export default Component.extend({
  /**
   * @property {MainMenuItem} mainMenuItems
   * @type {AppModel}
   */
  appModel: null,

  items: alias('appModel.mainMenuItems'),

  init() {
    this._super(...arguments);
    let {
      appModel
    } = this.getProperties('appModel');
    assert(
      appModel,
      'route:onedata: appModel should not be null'
    );
  }
});
