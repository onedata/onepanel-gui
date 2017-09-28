/**
 * @typedef {Ember.Object} SpaceCleaningBarData
 * @property {number} spaceSize Total space size (in bytes).
 * @property {number} usedSpace Used space size (in bytes).
 * @property {number} cleanThreshold Size of space, that should be cleaned 
 * (in bytes).
 * @property {number} cleanTarget Size of cleaned space (in bytes).
 * @property {boolean} isCleaning If true, space is being cleaned.
 */

import Ember from 'ember';

const {
  Component,
  computed,
  observer,
  on,
  RSVP: {
    Promise,
  },
} = Ember;

export default Component.extend({
  classNames: ['space-cleaning-bar-chart'],
  classNameBindings: ['_disabled:disabled'],

  /**
   * Chart data.
   * @type {SpaceCleaningBarData}
   */
  data: null,

  /**
   * Action called on slider value change. First argument is an object with
   * fields: cleanTarget, cleanThreshold.
   * @type {Function}
   */
  onChange: () => Promise.resolve(),

  /**
   * If false, labels edition is disabled.
   * @type {boolean}
   */
  _allowLabelsEdition: true,

  /**
   * If true, sliders are disabled.
   * @type {boolean}
   */
  _disabled: false,

  /**
   * Clean target value for bar chart.
   * @type {computed.boolean}
   */
  cleanTarget: computed('data.cleanTarget', {
    get() {
      return this.get('data.cleanTarget');
    },
    set(key, value) {
      return value;
    },
  }),

  /**
   * Clean threshold value for bar chart.
   * @type {computed.boolean}
   */
  cleanThreshold: computed('data.cleanThreshold', {
    get() {
      return this.get('data.cleanThreshold');
    },
    set(key, value) {
      return value;
    },
  }),

  /**
   * Clean target value for slider.
   * @type {computed.boolean}
   */
  cleanTargetForSlider: computed('data.cleanTarget', {
    get() {
      return this.get('data.cleanTarget');
    },
    set(key, value) {
      return value;
    },
  }),

  /**
   * Clean threshold value for slider.
   * @type {computed.boolean}
   */
  cleanThresholdForSlider: computed('data.cleanThreshold', {
    get() {
      return this.get('data.cleanThreshold');
    },
    set(key, value) {
      return value;
    },
  }),

  /**
   * Clean target value for bar chart (in percents).
   * @type {computed.number}
   */
  cleanTargetPercent: computed('cleanTarget', 'data.spaceSize', function () {
    let {
      cleanTarget, 
      data,
    } = this.getProperties('cleanTarget', 'data');
    return (cleanTarget / data.get('spaceSize')) * 100;
  }),

  /**
   * Clean threshold value for bar chart (in percents).
   * @type {computed.number}
   */
  cleanThresholdPercent: computed('cleanThreshold', 'data.spaceSize', function () {
    let {
      cleanThreshold, 
      data,
    } = this.getProperties('cleanThreshold', 'data');
    return (cleanThreshold / data.get('spaceSize')) * 100;
  }),

  /**
   * Slider range.
   * @type {computed.Object}
   */
  sliderRange: computed('data.spaceSize', function () {
    return {
      min: 0,
      max: this.get('data.spaceSize'),
    };
  }),

  /**
   * Slider values.
   * @type {computed.Array.number}
   */
  sliderStartValues: computed(
    'cleanThresholdForSlider',
    'cleanTargetForSlider',
    function () {
      let {
        cleanThresholdForSlider,
        cleanTargetForSlider,
      } = this.getProperties('cleanThresholdForSlider', 'cleanTargetForSlider');
      return [cleanTargetForSlider, cleanThresholdForSlider];
    }
  ),

  /**
   * Percent of used space.
   * @type {computed.boolean}
   */
  usedPercent: computed('data.spaceSize', 'data.usedSpace', function () {
    let data = this.get('data');
    let {
      spaceSize,
      usedSpace,
    } = data.getProperties('spaceSize', 'usedSpace');
    return (usedSpace / spaceSize) * 100;
  }),

  /**
   * Free space.
   * @type {computed.boolean}
   */
  freeSpace: computed('data.spaceSize', 'data.usedSpace', function () {
    let {
      spaceSize,
      usedSpace,
    } = this.get('data');
    return spaceSize - usedSpace;
  }),

  /**
   * Space to release.
   * @type {computed.boolean}
   */
  toReleaseSpace: computed('cleanTarget', 'data.usedSpace', function () {
    let {
      cleanTarget,
      data,
    } = this.getProperties('cleanTarget', 'data');
    return Math.max(0, data.get('usedSpace') - cleanTarget);
  }),

  /**
   * Percent of used space below clean target.
   * @type {computed.number}
   */
  usedBelowTargetPercent: computed(
    'data.spaceSize',
    'data.usedSpace',
    'cleanTarget', function () {
    let {
      data,
      cleanTarget,
     } = this.getProperties('data', 'cleanTarget');
    let {
      spaceSize,
      usedSpace,
    } = data.getProperties('spaceSize', 'usedSpace');
    if (usedSpace >= cleanTarget) {
      return (cleanTarget / spaceSize) * 100;
    } else {
      return (usedSpace / spaceSize) * 100;
    }
  }),

  /**
   * Percent of not used space below clean target.
   * @type {computed.number}
   */
  notUsedBelowTargetPercent: computed(
    'data.spaceSize',
    'cleanTarget',
    'usedBelowTargetPercent', function () {
    let { 
      data,
      cleanTarget,
      usedBelowTargetPercent,
    } = this.getProperties('data', 'cleanTarget', 'usedBelowTargetPercent');
    let spaceSize = data.get('spaceSize');
    return (cleanTarget / spaceSize) * 100 - usedBelowTargetPercent;
  }),

  /**
   * Percent of used space below clean threshold and over clean target.
   * @type {computed.number}
   */
  usedBelowThresholdPercent: computed(
    'data.spaceSize',
    'data.usedSpace',
    'cleanTarget',
    'cleanThreshold', function () {
    let {
      data,
      cleanTarget,
      cleanThreshold,
    } = this.getProperties('data', 'cleanTarget', 'cleanThreshold');
    let {
      spaceSize,
      usedSpace,
    } = data.getProperties('spaceSize', 'usedSpace');
    if (usedSpace <= cleanTarget) {
      return 0;
    } else if (usedSpace >= cleanThreshold) {
      return ((cleanThreshold - cleanTarget) / spaceSize) * 100;
    } else {
      return ((usedSpace - cleanTarget) / spaceSize) * 100;
    }
  }),

  /**
   * Percent of not used space below clean threshold and over clean target.
   * @type {computed.number}
   */
  notUsedBelowThresholdPercent: computed(
    'data.spaceSize',
    'cleanTarget',
    'cleanThreshold',
    'usedBelowThresholdPercent', function () {
    let { 
      data,
      cleanTarget,
      cleanThreshold,
      usedBelowThresholdPercent,
    } = this.getProperties(
      'data',
      'cleanTarget',
      'cleanThreshold',
      'usedBelowThresholdPercent'
    );
    let spaceSize = data.get('spaceSize');
    return ((cleanThreshold - cleanTarget) / spaceSize) * 100 -
      usedBelowThresholdPercent;
  }),

  /**
   * Percent of used space over clean threshold.
   * @type {computed.number}
   */
  usedOverThresholdPercent: computed(
    'data.spaceSize',
    'data.usedSpace',
    'cleanThreshold',
    function () {
      let {
        data,
        cleanThreshold,
      } = this.getProperties('data', 'cleanThreshold');
      let {
        spaceSize,
        usedSpace,
      } = data.getProperties('spaceSize', 'usedSpace');
      if (usedSpace <= cleanThreshold) {
        return 0;
      } else {
        return ((usedSpace - cleanThreshold) / spaceSize) * 100;
      }
    }
  ),

  /**
   * Percent of not used space below clean target.
   * @type {computed.number}
   */
  notUsedOverThresholdPercent: computed(
    'data.spaceSize',
    'cleanThreshold',
    'usedOverThresholdPercent', function () {
    let { 
      data,
      cleanThreshold,
      usedOverThresholdPercent,
    } = this.getProperties('data', 'cleanThreshold', 'usedOverThresholdPercent');
    let spaceSize = data.get('spaceSize');
    return ((spaceSize - cleanThreshold) / spaceSize) * 100 -
      usedOverThresholdPercent;
  }),

  /**
   * Sets chart elements styles.
   */
  valuesOberserver: on('didInsertElement', observer(
    'usedPercent',
    'usedBelowTargetPercent',
    'notUsedBelowTargetPercent',
    'usedBelowThresholdPercent',
    'notUsedBelowThresholdPercent',
    'usedOverThresholdPercent',
    'notUsedOverThresholdPercent',
    function () {
      let properties = [
        'usedBelowTargetPercent',
        'notUsedBelowTargetPercent',
        'usedBelowThresholdPercent',
        'notUsedBelowThresholdPercent',
        'usedOverThresholdPercent',
        'notUsedOverThresholdPercent',
      ];
      let classes = [
        'used-below-target',
        'not-used-below-target',
        'used-below-threshold',
        'not-used-below-threshold',
        'used-over-threshold',
        'not-used-over-threshold',
      ];
      let usedPercent = this.get('usedPercent');
      let percentSum = 0;
      properties.forEach((property, index) => {
        let element = this.$('.' + classes[index]);
        let propertyValue = this.get(property);
        element.css({
          'width': propertyValue + '%',
          'left': percentSum + '%',
        });
        percentSum += propertyValue;
        if (!propertyValue) {
          element.addClass('hidden');
        } else {
          element.removeClass('hidden');
        }
      });
      let usedWidth = { 'width': usedPercent + '%' };
      this.$('.used').css(usedWidth);
      this.$('.pacman-row .used-space').css(usedWidth);
    }
  )),

  /**
   * Sends data
   */
  _change() {
    let {
      cleanTarget,
      cleanThreshold,
      onChange,
    } = this.getProperties('cleanTarget', 'cleanThreshold', 'onChange');
    let values = {
      cleanTarget,
      cleanThreshold,
    };
    this.set('_disabled', true);
    onChange(values).then(() => this.set('_disabled', false));
  },

  actions: {
    /**
     * On slider move
     * @param {Array.number} values 
     */
    slide(values) {
      this.setProperties({
        cleanThreshold: values[1],
        cleanTarget: values[0],
        _allowLabelsEdition: false,
      });
    },
    /**
     * On slider move end
     * @param {Array.number} values 
     */
    sliderChanged(values) {
      this.setProperties({
        cleanTargetForSlider: values[0],
        cleanThresholdForSlider: values[1],
        _allowLabelsEdition: true,
      });
      this._change();
    },
    /**
     * Value changed by inputs
     * @param {string} name field name
     * @param {number} value value
     */
    valueChanged(name, value) {
      let data = this.get('data');
      let {
        spaceSize,
        cleanTarget,
        cleanThreshold,
      } = data.getProperties('spaceSize', 'cleanTarget', 'cleanThreshold');
      switch (name) {
        case 'cleanTarget':
          if (value >= 0 && value < cleanThreshold) {
            this.setProperties({
              cleanTarget: value,
              cleanTargetForSlider: value,
            });
            this._change();
          }
          break;
        case 'cleanThreshold':
          if (value > cleanTarget && value <= spaceSize) {
            this.setProperties({
              cleanThreshold: value,
              cleanThresholdForSlider: value,
            });
            this._change();
          }
          break;
      }
    },
  },
});
