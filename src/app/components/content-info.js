import Ember from 'ember';

// TODO: make a link or action option
export default Ember.Component.extend({
  classNames: ['content-info'],

  header: '',
  subheader: '',
  text: '',
  imagePath: null,
  buttonLabel: '',

  /**
   * A function on click primary button.
   * The function should return Promise which indicated status of action.
   * @type {Function}
   */
  buttonAction: null,
});
