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
 * @property {number} treshold Size of space, that should be cleaned 
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
   * fields: target, treshold.
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
  _target: oneWayModifiable('data.target', function () {
    return this.get('data.target');
  }),

  /**
   * Space hard quota value for bar chart.
   * @type {computed.boolean}
   */
  _treshold: oneWayModifiable('data.treshold', function () {
    return this.get('data.treshold');
  }),

  /**
   * Space soft quota value for slider.
   * @type {computed.boolean}
   */
  _targetForSlider: oneWayModifiable('data.target', function () {
    return this.get('data.target');
  }),

  /**
   * Space hard quota value for slider.
   * @type {computed.boolean}
   */
  _tresholdForSlider: oneWayModifiable('data.treshold', function () {
    return this.get('data.treshold');
  }),

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
  _tresholdPercent: computed('_treshold', 'data.spaceSize', function () {
    let {
      _treshold,
      data,
    } = this.getProperties('_treshold', 'data');
    return (_treshold / data.get('spaceSize')) * 100;
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
    '_tresholdForSlider',
    '_targetForSlider',
    function () {
      let {
        _tresholdForSlider,
        _targetForSlider,
      } = this.getProperties('_tresholdForSlider', '_targetForSlider');
      return [_targetForSlider, _tresholdForSlider];
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
    '_treshold',
    function () {
      let {
        data,
        _target,
        _treshold,
      } = this.getProperties('data', '_target', '_treshold');
      let {
        spaceSize,
        spaceUsed,
      } = data.getProperties('spaceSize', 'spaceUsed');
      if (spaceUsed <= _target) {
        return 0;
      } else if (spaceUsed >= _treshold) {
        return ((_treshold - _target) / spaceSize) * 100;
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
    '_treshold',
    '_usedBelowHardQuotaPercent',
    function () {
      let {
        data,
        _target,
        _treshold,
        _usedBelowHardQuotaPercent,
      } = this.getProperties(
        'data',
        '_target',
        '_treshold',
        '_usedBelowHardQuotaPercent'
      );
      let spaceSize = data.get('spaceSize');
      return ((_treshold - _target) / spaceSize) * 100 -
        _usedBelowHardQuotaPercent;
    }
  ),

  /**
   * Percent of used space over space hard quota.
   * @type {computed.number}
   */
  _usedOverHardQuotaPercent: computed(
    'data.{spaceSize,spaceUsed}',
    '_treshold',
    function () {
      let {
        data,
        _treshold,
      } = this.getProperties('data', '_treshold');
      let {
        spaceSize,
        spaceUsed,
      } = data.getProperties('spaceSize', 'spaceUsed');
      if (spaceUsed <= _treshold) {
        return 0;
      } else {
        return ((spaceUsed - _treshold) / spaceSize) * 100;
      }
    }
  ),

  /**
   * Percent of not used space below space soft quota.
   * @type {computed.number}
   */
  _notUsedOverHardQuotaPercent: computed(
    'data.spaceSize',
    '_treshold',
    '_usedOverHardQuotaPercent',
    function () {
      let {
        data,
        _treshold,
        _usedOverHardQuotaPercent,
      } = this.getProperties('data', '_treshold', '_usedOverHardQuotaPercent');
      let spaceSize = data.get('spaceSize');
      return ((spaceSize - _treshold) / spaceSize) * 100 -
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
      _treshold,
      onChange,
    } = this.getProperties('_target', '_treshold', 'onChange');
    let values = {
      target: _target,
      treshold: _treshold,
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
        _treshold: Math.floor(values[1]),
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
        _tresholdForSlider: Math.floor(values[1]),
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
        treshold,
      } = data.getProperties('spaceSize', 'target', 'treshold');
      switch (name) {
        case 'target':
          if (value >= 0 && value < treshold) {
            this.setProperties({
              _target: value,
              _targetForSlider: value,
            });
            this._change();
          }
          break;
        case 'treshold':
          if (value > target && value <= spaceSize) {
            this.setProperties({
              _treshold: value,
              _tresholdForSlider: value,
            });
            this._change();
          }
          break;
      }
    },
  },
});
