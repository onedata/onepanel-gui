/**
 * A bar chart with slider which shows soft and hard quota for space autocleaning.
 *
 * @module components/space-cleaning-bar-chart
 * @author Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import {
  getProperties,
  get,
  observer,
  computed,
} from '@ember/object';
import { Promise } from 'rsvp';
import { run } from '@ember/runloop';
import oneWayModifiable from 'onedata-gui-common/utils/one-way-modifiable';
import $ from 'jquery';

// Bar animation time (in seconds).
const ANIMATION_TIME = 2;

export default Component.extend({
  classNames: ['space-cleaning-bar-chart'],
  classNameBindings: ['_disabled:disabled'],

  /**
   * Space auto-cleaning settings.
   * @virtual
   * @type {Object}
   */
  settings: null,

  /**
   * Space auto-cleaning status.
   * @virtual
   * @type {Object}
   */
  status: null,

  /**
   * Space sizes.
   * @virtual
   * @type {number}
   */
  spaceSize: null,

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
   * If true, bar animations are enabled.
   * @type {boolean}
   */
  _allowBarAnimations: true,

  /**
   * Previous bar percent values. Set by valuesObserver.
   * @type {Object}
   */
  _oldPercentValues: undefined,

  /**
   * Space soft quota value for bar chart.
   * @type {computed.boolean}
   */
  _target: oneWayModifiable('settings.target'),

  /**
   * Space hard quota value for bar chart.
   * @type {computed.boolean}
   */
  _threshold: oneWayModifiable('settings.threshold'),

  /**
   * Space soft quota value for slider.
   * @type {computed.boolean}
   */
  _targetForSlider: oneWayModifiable('settings.target'),

  /**
   * Space hard quota value for slider.
   * @type {computed.boolean}
   */
  _thresholdForSlider: oneWayModifiable('settings.threshold'),

  /**
   * Space soft quota value for bar chart (in percents).
   * @type {computed.number}
   */
  _targetPercent: computed('_target', 'spaceSize', function () {
    const {
      _target,
      spaceSize,
    } = this.getProperties('_target', 'spaceSize');
    return (_target / spaceSize) * 100;
  }),

  /**
   * Space hard quota value for bar chart (in percents).
   * @type {computed.number}
   */
  _thresholdPercent: computed('_threshold', 'spaceSize', function () {
    const {
      _threshold,
      spaceSize,
    } = this.getProperties('_threshold', 'spaceSize');
    return (_threshold / spaceSize) * 100;
  }),

  /**
   * Slider range.
   * @type {computed.Object}
   */
  _sliderRange: computed('spaceSize', function () {
    return {
      min: 0,
      max: this.get('spaceSize'),
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
      const {
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
  _usedPercent: computed('spaceSize', 'status.spaceOccupancy', function () {
    const {
      spaceSize,
      status,
    } = this.getProperties('spaceSize', 'status');
    return (Math.min(get(status, 'spaceOccupancy'), spaceSize) / spaceSize) * 100;
  }),

  /**
   * Free space.
   * @type {computed.number}
   */
  _freeSpace: computed('spaceSize', 'status.spaceOccupancy', function () {
    const {
      spaceSize,
      status,
    } = this.getProperties('spaceSize', 'status');
    return spaceSize - Math.min(get(status, 'spaceOccupancy'), spaceSize);
  }),

  /**
   * Space to release.
   * @type {computed.number}
   */
  _toReleaseSpace: computed('_target', 'status.spaceOccupancy', function () {
    const {
      _target,
      status,
    } = this.getProperties('_target', 'status');
    return Math.max(0, get(status, 'spaceOccupancy') - _target);
  }),

  /**
   * Percent of used space below space soft quota.
   * @type {computed.number}
   */
  _usedBelowSoftQuotaPercent: computed(
    'spaceSize',
    'status.spaceOccupancy',
    '_target',
    function () {
      const {
        spaceSize,
        status,
        _target,
      } = this.getProperties('spaceSize', 'status', '_target');
      return (Math.min(get(status, 'spaceOccupancy'), _target) / spaceSize) * 100;
    }
  ),

  /**
   * Percent of not used space below space soft quota.
   * @type {computed.number}
   */
  _notUsedBelowSoftQuotaPercent: computed(
    'spaceSize',
    '_target',
    '_usedBelowSoftQuotaPercent',
    function () {
      const {
        spaceSize,
        _target,
        _usedBelowSoftQuotaPercent,
      } = this.getProperties('spaceSize', '_target', '_usedBelowSoftQuotaPercent');
      return (_target / spaceSize) * 100 - _usedBelowSoftQuotaPercent;
    }
  ),

  /**
   * Percent of used space below space hard quota and over space soft quota.
   * @type {computed.number}
   */
  _usedBelowHardQuotaPercent: computed(
    'spaceSize',
    'status.spaceOccupancy',
    '_target',
    '_threshold',
    function () {
      const {
        spaceSize,
        status,
        _target,
        _threshold,
      } = this.getProperties('spaceSize', 'status', '_target', '_threshold');
      const spaceOccupancy = get(status, 'spaceOccupancy');
      if (spaceOccupancy <= _target) {
        return 0;
      } else {
        return ((Math.min(_threshold, spaceOccupancy) - _target) / spaceSize) * 100;
      }
    }
  ),

  /**
   * Percent of not used space below space hard quota and over space soft quota.
   * @type {computed.number}
   */
  _notUsedBelowHardQuotaPercent: computed(
    'spaceSize',
    '_target',
    '_threshold',
    '_usedBelowHardQuotaPercent',
    function () {
      const {
        spaceSize,
        _target,
        _threshold,
        _usedBelowHardQuotaPercent,
      } = this.getProperties(
        'spaceSize',
        '_target',
        '_threshold',
        '_usedBelowHardQuotaPercent'
      );
      return ((_threshold - _target) / spaceSize) * 100 -
        _usedBelowHardQuotaPercent;
    }
  ),

  /**
   * Percent of used space over space hard quota.
   * @type {computed.number}
   */
  _usedOverHardQuotaPercent: computed(
    'spaceSize',
    'status.spaceOccupancy',
    '_threshold',
    function () {
      const {
        spaceSize,
        status,
        _threshold,
      } = this.getProperties('spaceSize', 'status', '_threshold');
      const spaceOccupancy = Math.min(get(status, 'spaceOccupancy'), spaceSize);
      return (Math.max(spaceOccupancy - _threshold, 0) / spaceSize) * 100;
    }
  ),

  /**
   * Percent of not used space below space soft quota.
   * @type {computed.number}
   */
  _notUsedOverHardQuotaPercent: computed(
    'spaceSize',
    '_threshold',
    '_usedOverHardQuotaPercent',
    function () {
      const {
        spaceSize,
        _threshold,
        _usedOverHardQuotaPercent,
      } = this.getProperties('spaceSize', '_threshold', '_usedOverHardQuotaPercent');
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
      const properties = [
        '_usedBelowSoftQuotaPercent',
        '_notUsedBelowSoftQuotaPercent',
        '_usedBelowHardQuotaPercent',
        '_notUsedBelowHardQuotaPercent',
        '_usedOverHardQuotaPercent',
        '_notUsedOverHardQuotaPercent',
      ];
      const classes = [
        'used-below-soft-quota',
        'not-used-below-soft-quota',
        'used-below-hard-quota',
        'not-used-below-hard-quota',
        'used-over-hard-quota',
        'not-used-over-hard-quota',
      ];
      const {
        element,
        _allowBarAnimations,
        _usedPercent,
        _oldPercentValues,
      } = this.getProperties(
        'element',
        '_allowBarAnimations',
        '_usedPercent',
        '_oldPercentValues'
      );
      const $element = $(element);
      const deltaUsedPercent = _usedPercent - _oldPercentValues._usedPercent;
      const transitions = {};
      const transitionElements = deltaUsedPercent > 0 ?
        properties : properties.slice(0).reverse();
      let delaySum = 0;
      for (let i = 0; i < transitionElements.length; i += 2) {
        let transition;
        if (_allowBarAnimations) {
          const subbarDelta = this.get(transitionElements[i]) -
            _oldPercentValues[transitionElements[i]];
          const animationTime =
            Math.abs(subbarDelta / deltaUsedPercent) * ANIMATION_TIME;
          const delay = delaySum;
          delaySum += animationTime;
          transition = {
            'transition': `width ${animationTime}s linear, left ${animationTime}s linear`,
            'transition-delay': `${delay}s`,
          };
        } else {
          transition = {
            'transition': 'none',
            'transition-delay': '0s',
          };
        }
        transitions[transitionElements[i]] = transition;
        transitions[transitionElements[i + 1]] = transition;
      }
      properties.forEach((prop, index) => {
        $element.find('.' + classes[index]).css(transitions[prop]);
      });
      let percentSum = 0;
      properties.forEach((property, index) => {
        const element = $element.find('.' + classes[index]);
        const propertyValue = this.get(property);
        element.css({
          width: propertyValue + '%',
          left: percentSum + '%',
        });
        percentSum += propertyValue;
      });
      const usedWidth = { width: _usedPercent + '%' };
      let standardBarAnimation;
      if (_allowBarAnimations) {
        standardBarAnimation = {
          transition: `width ${ANIMATION_TIME}s linear, left ${ANIMATION_TIME}s linear`,
        };
      } else {
        standardBarAnimation = {
          transition: 'none',
        };
      }
      $element.find('.used, .pacman-row .used-space, .pacman-cell')
        .css(standardBarAnimation);
      $element.find('.used, .pacman-row .used-space').css(usedWidth);
      properties.forEach((prop) => _oldPercentValues[prop] = this.get(prop));
      _oldPercentValues._usedPercent = _usedPercent;
      this.set('_oldPercentValues', _oldPercentValues);
    }
  ),

  init() {
    this._super(...arguments);
    this.set('_oldPercentValues', {});
  },

  didInsertElement() {
    this._super(...arguments);
    this.valuesObserver();
  },

  /**
   * Sends data
   */
  _change() {
    const {
      _target,
      _threshold,
      onChange,
    } = this.getProperties('_target', '_threshold', 'onChange');
    const values = {
      target: _target,
      threshold: _threshold,
    };
    this.setProperties({
      _disabled: true,
      _allowLabelsEdition: false,
    });
    onChange(values).catch(() => {
      const settings = this.get('settings');
      const {
        target,
        threshold,
      } = getProperties(settings, 'target', 'threshold');
      this.setProperties({
        _target: target,
        _targetForSlider: target,
        _threshold: threshold,
        _thresholdForSlider: threshold,
      });
    }).then(() => this.setProperties({
      _disabled: false,
      _allowLabelsEdition: true,
    }));
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
        _allowBarAnimations: false,
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
        _allowBarAnimations: true,
      });
      this._change();
    },

    /**
     * Value changed by inputs
     * @param {string} name field name
     * @param {number} value value
     */
    valueChanged(name, value) {
      const {
        spaceSize,
        settings,
      } = this.getProperties('spaceSize', 'settings');
      const {
        target,
        threshold,
      } = getProperties(settings, 'target', 'threshold');
      this.set('_allowBarAnimations', false);
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
      run.next(() => this.set('_allowBarAnimations', true));
    },
  },
});
