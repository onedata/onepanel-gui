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
 * @property {number} spaceHardQuota Size of space, that should be cleaned 
 * (in bytes).
 * @property {number} spaceSoftQuota Size of cleaned space (in bytes).
 * @property {boolean} isWorking If true, space is being cleaned.
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
   * fields: spaceSoftQuota, spaceHardQuota.
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
  _spaceSoftQuota: computed('data.spaceSoftQuota', {
    get() {
      return this.get('data.spaceSoftQuota');
    },
    set(key, value) {
      return value;
    },
  }),

  /**
   * Space hard quota value for bar chart.
   * @type {computed.boolean}
   */
  _spaceHardQuota: computed('data.spaceHardQuota', {
    get() {
      return this.get('data.spaceHardQuota');
    },
    set(key, value) {
      return value;
    },
  }),

  /**
   * Space soft quota value for slider.
   * @type {computed.boolean}
   */
  _spaceSoftQuotaForSlider: computed('data.spaceSoftQuota', {
    get() {
      return this.get('data.spaceSoftQuota');
    },
    set(key, value) {
      return value;
    },
  }),

  /**
   * Space hard quota value for slider.
   * @type {computed.boolean}
   */
  _spaceHardQuotaForSlider: computed('data.spaceHardQuota', {
    get() {
      return this.get('data.spaceHardQuota');
    },
    set(key, value) {
      return value;
    },
  }),

  /**
   * Space soft quota value for bar chart (in percents).
   * @type {computed.number}
   */
  _spaceSoftQuotaPercent: computed('_spaceSoftQuota', 'data.spaceSize', function () {
    let {
      _spaceSoftQuota,
      data,
    } = this.getProperties('_spaceSoftQuota', 'data');
    return (_spaceSoftQuota / data.get('spaceSize')) * 100;
  }),

  /**
   * Space hard quota value for bar chart (in percents).
   * @type {computed.number}
   */
  _spaceHardQuotaPercent: computed('_spaceHardQuota', 'data.spaceSize', function () {
    let {
      _spaceHardQuota,
      data,
    } = this.getProperties('_spaceHardQuota', 'data');
    return (_spaceHardQuota / data.get('spaceSize')) * 100;
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
    '_spaceHardQuotaForSlider',
    '_spaceSoftQuotaForSlider',
    function () {
      let {
        _spaceHardQuotaForSlider,
        _spaceSoftQuotaForSlider,
      } = this.getProperties('_spaceHardQuotaForSlider', '_spaceSoftQuotaForSlider');
      return [_spaceSoftQuotaForSlider, _spaceHardQuotaForSlider];
    }
  ),

  /**
   * Percent of used space.
   * @type {computed.boolean}
   */
  _usedPercent: computed('data.spaceSize', 'data.spaceUsed', function () {
    let data = this.get('data');
    let {
      spaceSize,
      spaceUsed,
    } = data.getProperties('spaceSize', 'spaceUsed');
    return (spaceUsed / spaceSize) * 100;
  }),

  /**
   * Free space.
   * @type {computed.boolean}
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
   * @type {computed.boolean}
   */
  _toReleaseSpace: computed('_spaceSoftQuota', 'data.spaceUsed', function () {
    let {
      _spaceSoftQuota,
      data,
    } = this.getProperties('_spaceSoftQuota', 'data');
    return Math.max(0, data.get('spaceUsed') - _spaceSoftQuota);
  }),

  /**
   * Percent of used space below space soft quota.
   * @type {computed.number}
   */
  _usedBelowSoftQuotaPercent: computed(
    'data.spaceSize',
    'data.spaceUsed',
    '_spaceSoftQuota',
    function () {
      let {
        data,
        _spaceSoftQuota,
      } = this.getProperties('data', '_spaceSoftQuota');
      let {
        spaceSize,
        spaceUsed,
      } = data.getProperties('spaceSize', 'spaceUsed');
      if (spaceUsed >= _spaceSoftQuota) {
        return (_spaceSoftQuota / spaceSize) * 100;
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
    '_spaceSoftQuota',
    '_usedBelowSoftQuotaPercent',
    function () {
      let {
        data,
        _spaceSoftQuota,
        _usedBelowSoftQuotaPercent,
      } = this.getProperties('data', '_spaceSoftQuota', '_usedBelowSoftQuotaPercent');
      let spaceSize = data.get('spaceSize');
      return (_spaceSoftQuota / spaceSize) * 100 - _usedBelowSoftQuotaPercent;
    }
  ),

  /**
   * Percent of used space below space hard quota and over space soft quota.
   * @type {computed.number}
   */
  _usedBelowHardQuotaPercent: computed(
    'data.spaceSize',
    'data.spaceUsed',
    '_spaceSoftQuota',
    '_spaceHardQuota',
    function () {
      let {
        data,
        _spaceSoftQuota,
        _spaceHardQuota,
      } = this.getProperties('data', '_spaceSoftQuota', '_spaceHardQuota');
      let {
        spaceSize,
        spaceUsed,
      } = data.getProperties('spaceSize', 'spaceUsed');
      if (spaceUsed <= _spaceSoftQuota) {
        return 0;
      } else if (spaceUsed >= _spaceHardQuota) {
        return ((_spaceHardQuota - _spaceSoftQuota) / spaceSize) * 100;
      } else {
        return ((spaceUsed - _spaceSoftQuota) / spaceSize) * 100;
      }
    }
  ),

  /**
   * Percent of not used space below space hard quota and over space soft quota.
   * @type {computed.number}
   */
  _notUsedBelowHardQuotaPercent: computed(
    'data.spaceSize',
    '_spaceSoftQuota',
    '_spaceHardQuota',
    '_usedBelowHardQuotaPercent',
    function () {
      let {
        data,
        _spaceSoftQuota,
        _spaceHardQuota,
        _usedBelowHardQuotaPercent,
      } = this.getProperties(
        'data',
        '_spaceSoftQuota',
        '_spaceHardQuota',
        '_usedBelowHardQuotaPercent'
      );
      let spaceSize = data.get('spaceSize');
      return ((_spaceHardQuota - _spaceSoftQuota) / spaceSize) * 100 -
        _usedBelowHardQuotaPercent;
    }
  ),

  /**
   * Percent of used space over space hard quota.
   * @type {computed.number}
   */
  _usedOverHardQuotaPercent: computed(
    'data.spaceSize',
    'data.spaceUsed',
    '_spaceHardQuota',
    function () {
      let {
        data,
        _spaceHardQuota,
      } = this.getProperties('data', '_spaceHardQuota');
      let {
        spaceSize,
        spaceUsed,
      } = data.getProperties('spaceSize', 'spaceUsed');
      if (spaceUsed <= _spaceHardQuota) {
        return 0;
      } else {
        return ((spaceUsed - _spaceHardQuota) / spaceSize) * 100;
      }
    }
  ),

  /**
   * Percent of not used space below space soft quota.
   * @type {computed.number}
   */
  _notUsedOverHardQuotaPercent: computed(
    'data.spaceSize',
    '_spaceHardQuota',
    '_usedOverHardQuotaPercent',
    function () {
      let {
        data,
        _spaceHardQuota,
        _usedOverHardQuotaPercent,
      } = this.getProperties('data', '_spaceHardQuota', '_usedOverHardQuotaPercent');
      let spaceSize = data.get('spaceSize');
      return ((spaceSize - _spaceHardQuota) / spaceSize) * 100 -
        _usedOverHardQuotaPercent;
    }
  ),

  /**
   * Sets chart elements styles.
   */
  valuesOberserver: on('didInsertElement', observer(
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
  )),

  /**
   * Sends data
   */
  _change() {
    let {
      _spaceSoftQuota,
      _spaceHardQuota,
      onChange,
    } = this.getProperties('_spaceSoftQuota', '_spaceHardQuota', 'onChange');
    let values = {
      spaceSoftQuota: _spaceSoftQuota,
      spaceHardQuota: _spaceHardQuota,
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
        _spaceHardQuota: Math.floor(values[1]),
        _spaceSoftQuota: Math.floor(values[0]),
        _allowLabelsEdition: false,
      });
    },
    /**
     * On slider move end
     * @param {Array.number} values 
     */
    sliderChanged(values) {
      this.setProperties({
        _spaceSoftQuotaForSlider: Math.floor(values[0]),
        _spaceHardQuotaForSlider: Math.floor(values[1]),
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
        spaceSoftQuota,
        spaceHardQuota,
      } = data.getProperties('spaceSize', 'spaceSoftQuota', 'spaceHardQuota');
      switch (name) {
        case 'spaceSoftQuota':
          if (value >= 0 && value < spaceHardQuota) {
            this.setProperties({
              _spaceSoftQuota: value,
              _spaceSoftQuotaForSlider: value,
            });
            this._change();
          }
          break;
        case 'spaceHardQuota':
          if (value > spaceSoftQuota && value <= spaceSize) {
            this.setProperties({
              _spaceHardQuota: value,
              _spaceHardQuotaForSlider: value,
            });
            this._change();
          }
          break;
      }
    },
  },
});
