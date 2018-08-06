import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  /**
   * @virtual
   * If true, icon shows success mark, othewise shows fail
   * @type {boolean}
   */
  success: undefined,
});
