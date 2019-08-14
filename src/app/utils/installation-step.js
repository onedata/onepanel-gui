/**
 * Represents single deployment step.
 * 
 * @module utils/installation-step
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {string}
   */
  name: undefined,

  /**
   * True when step should not be rendered as a standalone step in deployment
   * wizard, but is rather a passthrough between adjecent steps.
   * @virtual
   * @type {boolean}
   */
  isHiddenStep: false,

  /**
   * @virtual
   * @type {boolean}
   */
  inOneprovider: true,

  /**
   * @virtual
   * @type {boolean}
   */
  inOnezone: true,

  /**
   * True when this step is a final step of the deployment (= deployment is done).
   * @virtual
   * @type {boolean}
   */
  isFinalStep: false,

  /**
   * Ordered installation steps.
   * @virtual
   * @type {Array<Utils.InstallationStep>}
   */
  stepsOrder: undefined,

  /**
   * Returns a number of steps to pass (including this step) to access
   * `anotherStep`. May be a negative number if `anotherStep` is before this one.
   * @param {InstallationStep} anotherStep
   * @returns {number}
   */
  stepsDelta(anotherStep) {
    const stepsOrder = this.get('stepsOrder');
    return stepsOrder.indexOf(anotherStep) -
      stepsOrder.indexOf(this);
  },

  /**
   * @param {InstallationStep} anotherStep
   * @returns {boolean}
   */
  lt(anotherStep) {
    return this.stepsDelta(anotherStep) > 0;
  },

  /**
   * @param {InstallationStep} anotherStep
   * @returns {boolean}
   */
  lte(anotherStep) {
    return this.stepsDelta(anotherStep) >= 0;
  },

  /**
   * @param {InstallationStep} anotherStep
   * @returns {boolean}
   */
  gt(anotherStep) {
    return this.stepsDelta(anotherStep) < 0;
  },

  /**
   * @param {InstallationStep} anotherStep
   * @returns {boolean}
   */
  gte(anotherStep) {
    return this.stepsDelta(anotherStep) <= 0;
  },
});
