import Ember from 'ember';

/**
 * @typedef {Cluster}
 * @param {string} name
 * @param {number} initStep
 */
export default Ember.Object.extend({
  name: null,
  initStep: 0,
});
