import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {string}
   */
  name: undefined,

  /**
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
   * @virtual
   * @type {boolean}
   */
  isFinalStep: false,

  /**
   * @virtual
   * @type {Array<string>}
   */
  stepsOrder: undefined,

  /**
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
