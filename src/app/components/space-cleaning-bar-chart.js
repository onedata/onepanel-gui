/**
 * A bar chart with slider which shows soft and hard quota for space autocleaning.
 *
 * @module components/space-cleaning-bar-chart
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Ember.Object} SpaceCleaningBarData
 * @property {number} spaceSize Total space size (in bytes).
 * @property {number} spaceUsed Used space size (in bytes).
 * @property {number} threshold Size of space, that should be cleaned 
 * (in bytes).
 * @property {number} target Size of cleaned space (in bytes).
 * @property {boolean} isWorking If true, space is being cleaned.
 */

import Ember from 'ember';
import oneWayModifiable from 'onedata-gui-common/utils/one-way-modifiable';

const {
  Component,
  computed,
  observer,
  RSVP: {
    Promise,
  },
} = Ember;

export default Component.extend({
  classNames: ['space-cleaning-bar-chart'],
  classNameBindings: ['_disabled:disabled'],

  /**
   * Chart data.
   * @virtual
   * @type {SpaceCleaningBarData}
   */
  data: null,

  /**
   * Action called on slider value change. First argument is an object with
   * fields: target, threshold.
   * @virtual
   * @type {Function}
   * @returns {Promise<any>}
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
   * Space soft quota value for bar chart.
   * @type {computed.boolean}
   */
  _target: oneWayModifiable('data.target'),

  /**
   * Space hard quota value for bar chart.
   * @type {computed.boolean}
   */
  _threshold: oneWayModifiable('data.threshold'),

  /**
   * Space soft quota value for slider.
   * @type {computed.boolean}
   */
  _targetForSlider: oneWayModifiable('data.target'),

  /**
   * Space hard quota value for slider.
   * @type {computed.boolean}
   */
  _thresholdForSlider: oneWayModifiable('data.threshold'),

  /**
   * Space soft quota value for bar chart (in percents).
   * @type {computed.number}
   */
  _targetPercent: computed('_target', 'data.spaceSize', function () {
    let {
      _target,
      data,
    } = this.getProperties('_target', 'data');
    return (_target / data.get('spaceSize')) * 100;
  }),

  /**
   * Space hard quota value for bar chart (in percents).
   * @type {computed.number}
   */
  _thresholdPercent: computed('_threshold', 'data.spaceSize', function () {
    let {
      _threshold,
      data,
    } = this.getProperties('_threshold', 'data');
    return (_threshold / data.get('spaceSize')) * 100;
  }),

  /**
   * Slider range.
   * @type {computed.Object}
   */
  _sliderRange: computed('data.spaceSize', function () {
    return {
      min: 0,
      max: this.get('data.spaceSize'),
    };
  }),

  /**
   * Slider values.
   * @type {computed.Array.number}
   */
  _sliderStartValues: computed(
    '_thresholdForSlider',
    '_targetForSlider',
    function () {
      let {
        _thresholdForSlider,
        _targetForSlider,
      } = this.getProperties('_thresholdForSlider', '_targetForSlider');
      return [_targetForSlider, _thresholdForSlider];
    }
  ),

  /**
   * Percent of used space.
   * @type {computed.boolean}
   */
  _usedPercent: computed('data.{spaceSize,spaceUsed}', function () {
    let data = this.get('data');
    let {
      spaceSize,
      spaceUsed,
    } = data.getProperties('spaceSize', 'spaceUsed');
    return (spaceUsed / spaceSize) * 100;
  }),

  /**
   * Free space.
   * @type {computed.number}
   */
  _freeSpace: computed('data.spaceSize', 'data.spaceUsed', function () {
    let {
      spaceSize,
      spaceUsed,
    } = this.get('data');
    return spaceSize - spaceUsed;
  }),

  /**
   * Space to release.
   * @type {computed.number}
   */
  _toReleaseSpace: computed('_target', 'data.spaceUsed', function () {
    let {
      _target,
      data,
    } = this.getProperties('_target', 'data');
    return Math.max(0, data.get('spaceUsed') - _target);
  }),

  /**
   * Percent of used space below space soft quota.
   * @type {computed.number}
   */
  _usedBelowSoftQuotaPercent: computed(
    'data.{spaceSize,spaceUsed}',
    '_target',
    function () {
      let {
        data,
        _target,
      } = this.getProperties('data', '_target');
      let {
        spaceSize,
        spaceUsed,
      } = data.getProperties('spaceSize', 'spaceUsed');
      if (spaceUsed >= _target) {
        return (_target / spaceSize) * 100;
      } else {
        return (spaceUsed / spaceSize) * 100;
      }
    }
  ),

  /**
   * Percent of not used space below space soft quota.
   * @type {computed.number}
   */
  _notUsedBelowSoftQuotaPercent: computed(
    'data.spaceSize',
    '_target',
    '_usedBelowSoftQuotaPercent',
    function () {
      let {
        data,
        _target,
        _usedBelowSoftQuotaPercent,
      } = this.getProperties('data', '_target', '_usedBelowSoftQuotaPercent');
      let spaceSize = data.get('spaceSize');
      return (_target / spaceSize) * 100 - _usedBelowSoftQuotaPercent;
    }
  ),

  /**
   * Percent of used space below space hard quota and over space soft quota.
   * @type {computed.number}
   */
  _usedBelowHardQuotaPercent: computed(
    'data.{spaceSize,spaceUsed}',
    '_target',
    '_threshold',
    function () {
      let {
        data,
        _target,
        _threshold,
      } = this.getProperties('data', '_target', '_threshold');
      let {
        spaceSize,
        spaceUsed,
      } = data.getProperties('spaceSize', 'spaceUsed');
      if (spaceUsed <= _target) {
        return 0;
      } else if (spaceUsed >= _threshold) {
        return ((_threshold - _target) / spaceSize) * 100;
      } else {
        return ((spaceUsed - _target) / spaceSize) * 100;
      }
    }
  ),

  /**
   * Percent of not used space below space hard quota and over space soft quota.
   * @type {computed.number}
   */
  _notUsedBelowHardQuotaPercent: computed(
    'data.spaceSize',
    '_target',
    '_threshold',
    '_usedBelowHardQuotaPercent',
    function () {
      let {
        data,
        _target,
        _threshold,
        _usedBelowHardQuotaPercent,
      } = this.getProperties(
        'data',
        '_target',
        '_threshold',
        '_usedBelowHardQuotaPercent'
      );
      let spaceSize = data.get('spaceSize');
      return ((_threshold - _target) / spaceSize) * 100 -
        _usedBelowHardQuotaPercent;
    }
  ),

  /**
   * Percent of used space over space hard quota.
   * @type {computed.number}
   */
  _usedOverHardQuotaPercent: computed(
    'data.{spaceSize,spaceUsed}',
    '_threshold',
    function () {
      let {
        data,
        _threshold,
      } = this.getProperties('data', '_threshold');
      let {
        spaceSize,
        spaceUsed,
      } = data.getProperties('spaceSize', 'spaceUsed');
      if (spaceUsed <= _threshold) {
        return 0;
      } else {
        return ((spaceUsed - _threshold) / spaceSize) * 100;
      }
    }
  ),

  /**
   * Percent of not used space below space soft quota.
   * @type {computed.number}
   */
  _notUsedOverHardQuotaPercent: computed(
    'data.spaceSize',
    '_threshold',
    '_usedOverHardQuotaPercent',
    function () {
      let {
        data,
        _threshold,
        _usedOverHardQuotaPercent,
      } = this.getProperties('data', '_threshold', '_usedOverHardQuotaPercent');
      let spaceSize = data.get('spaceSize');
      return ((spaceSize - _threshold) / spaceSize) * 100 -
        _usedOverHardQuotaPercent;
    }
  ),

  /**
   * Sets chart elements styles.
   */
  valuesObserver: observer(
    '_usedPercent',
    '_usedBelowSoftQuotaPercent',
    '_notUsedBelowSoftQuotaPercent',
    '_usedBelowHardQuotaPercent',
    '_notUsedBelowHardQuotaPercent',
    '_usedOverHardQuotaPercent',
    '_notUsedOverHardQuotaPercent',
    function () {
      let properties = [
        '_usedBelowSoftQuotaPercent',
        '_notUsedBelowSoftQuotaPercent',
        '_usedBelowHardQuotaPercent',
        '_notUsedBelowHardQuotaPercent',
        '_usedOverHardQuotaPercent',
        '_notUsedOverHardQuotaPercent',
      ];
      let classes = [
        'used-below-soft-quota',
        'not-used-below-soft-quota',
        'used-below-hard-quota',
        'not-used-below-hard-quota',
        'used-over-hard-quota',
        'not-used-over-hard-quota',
      ];
      let usedPercent = this.get('_usedPercent');
      let percentSum = 0;
      properties.forEach((property, index) => {
        let element = this.$('.' + classes[index]);
        let propertyValue = this.get(property);
        element.css({
          width: propertyValue + '%',
          left: percentSum + '%',
        });
        percentSum += propertyValue;
        if (!propertyValue) {
          element.addClass('hidden');
        } else {
          element.removeClass('hidden');
        }
      });
      let usedWidth = { width: usedPercent + '%' };
      this.$('.used').css(usedWidth);
      this.$('.pacman-row .used-space').css(usedWidth);
    }
  ),

  didInsertElement() {
    this._super(...arguments);
    this.valuesObserver();
  },

  /**
   * Sends data
   */
  _change() {
    let {
      _target,
      _threshold,
      onChange,
    } = this.getProperties('_target', '_threshold', 'onChange');
    let values = {
      target: _target,
      threshold: _threshold,
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
        _threshold: Math.floor(values[1]),
        _target: Math.floor(values[0]),
        _allowLabelsEdition: false,
      });
    },

    /**
     * On slider move end
     * @param {Array.number} values 
     */
    sliderChanged(values) {
      this.setProperties({
        _targetForSlider: Math.floor(values[0]),
        _thresholdForSlider: Math.floor(values[1]),
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
        target,
        threshold,
      } = data.getProperties('spaceSize', 'target', 'threshold');
      switch (name) {
        case 'target':
          if (value >= 0 && value < threshold) {
            this.setProperties({
              _target: value,
              _targetForSlider: value,
            });
            this._change();
          }
          break;
        case 'threshold':
          if (value > target && value <= spaceSize) {
            this.setProperties({
              _threshold: value,
              _thresholdForSlider: value,
            });
            this._change();
          }
          break;
      }
    },
  },
});
