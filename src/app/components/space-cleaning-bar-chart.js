/**
 * A bar chart with slider which shows soft and hard quota for space autocleaning.
 *
 * @module components/space-cleaning-bar-chart
 * @author Michal Borzecki
 * @copyright (C) 2017-2022 ACK CYFRONET AGH
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
import dom from 'onedata-gui-common/utils/dom';

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
  targetSoftQuota: oneWayModifiable('settings.target'),

  /**
   * Space hard quota value for bar chart.
   * @type {computed.boolean}
   */
  threshold: oneWayModifiable('settings.threshold'),

  /**
   * Space soft quota value for slider.
   * @type {computed.boolean}
   */
  targetForSlider: oneWayModifiable('settings.target'),

  /**
   * Space hard quota value for slider.
   * @type {computed.boolean}
   */
  thresholdForSlider: oneWayModifiable('settings.threshold'),

  /**
   * Space soft quota value for bar chart (in percents).
   * @type {computed.number}
   */
  targetPercent: computed('targetSoftQuota', 'spaceSize', function targetPercent() {
    const {
      targetSoftQuota,
      spaceSize,
    } = this.getProperties('targetSoftQuota', 'spaceSize');
    return (targetSoftQuota / spaceSize) * 100;
  }),

  /**
   * Space hard quota value for bar chart (in percents).
   * @type {computed.number}
   */
  thresholdPercent: computed('threshold', 'spaceSize', function thresholdPercent() {
    const {
      threshold,
      spaceSize,
    } = this.getProperties('threshold', 'spaceSize');
    return (threshold / spaceSize) * 100;
  }),

  /**
   * Slider range.
   * @type {computed.Object}
   */
  sliderRange: computed('spaceSize', function sliderRange() {
    return {
      min: 0,
      max: this.get('spaceSize'),
    };
  }),

  /**
   * Slider values.
   * @type {computed.Array.number}
   */
  sliderStartValues: computed(
    'thresholdForSlider',
    'targetForSlider',
    function sliderStartValues() {
      const {
        thresholdForSlider,
        targetForSlider,
      } = this.getProperties('thresholdForSlider', 'targetForSlider');
      return [targetForSlider, thresholdForSlider];
    }
  ),

  /**
   * Percent of used space.
   * @type {computed.boolean}
   */
  usedPercent: computed('spaceSize', 'status.spaceOccupancy', function usedPercent() {
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
  freeSpace: computed('spaceSize', 'status.spaceOccupancy', function freeSpace() {
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
  toReleaseSpace: computed(
    'targetSoftQuota',
    'status.spaceOccupancy',
    function toReleaseSpace() {
      const {
        targetSoftQuota,
        status,
      } = this.getProperties('targetSoftQuota', 'status');
      return Math.max(0, get(status, 'spaceOccupancy') - targetSoftQuota);
    }
  ),

  /**
   * Percent of used space below space soft quota.
   * @type {computed.number}
   */
  usedBelowSoftQuotaPercent: computed(
    'spaceSize',
    'status.spaceOccupancy',
    'targetSoftQuota',
    function usedBelowSoftQuotaPercent() {
      const {
        spaceSize,
        status,
        targetSoftQuota,
      } = this.getProperties('spaceSize', 'status', 'targetSoftQuota');
      return (Math.min(get(status, 'spaceOccupancy'), targetSoftQuota) / spaceSize) * 100;
    }
  ),

  /**
   * Percent of not used space below space soft quota.
   * @type {computed.number}
   */
  notUsedBelowSoftQuotaPercent: computed(
    'spaceSize',
    'targetSoftQuota',
    'usedBelowSoftQuotaPercent',
    function notUsedBelowSoftQuotaPercent() {
      const {
        spaceSize,
        targetSoftQuota,
        usedBelowSoftQuotaPercent,
      } = this.getProperties('spaceSize', 'targetSoftQuota', 'usedBelowSoftQuotaPercent');
      return (targetSoftQuota / spaceSize) * 100 - usedBelowSoftQuotaPercent;
    }
  ),

  /**
   * Percent of used space below space hard quota and over space soft quota.
   * @type {computed.number}
   */
  usedBelowHardQuotaPercent: computed(
    'spaceSize',
    'status.spaceOccupancy',
    'targetSoftQuota',
    'threshold',
    function usedBelowHardQuotaPercent() {
      const {
        spaceSize,
        status,
        targetSoftQuota,
        threshold,
      } = this.getProperties('spaceSize', 'status', 'targetSoftQuota', 'threshold');
      const spaceOccupancy = get(status, 'spaceOccupancy');
      if (spaceOccupancy <= targetSoftQuota) {
        return 0;
      } else {
        return (
          (Math.min(threshold, spaceOccupancy) - targetSoftQuota) / spaceSize
        ) * 100;
      }
    }
  ),

  /**
   * Percent of not used space below space hard quota and over space soft quota.
   * @type {computed.number}
   */
  notUsedBelowHardQuotaPercent: computed(
    'spaceSize',
    'targetSoftQuota',
    'threshold',
    'usedBelowHardQuotaPercent',
    function notUsedBelowHardQuotaPercent() {
      const {
        spaceSize,
        targetSoftQuota,
        threshold,
        usedBelowHardQuotaPercent,
      } = this.getProperties(
        'spaceSize',
        'targetSoftQuota',
        'threshold',
        'usedBelowHardQuotaPercent'
      );
      return ((threshold - targetSoftQuota) / spaceSize) * 100 -
        usedBelowHardQuotaPercent;
    }
  ),

  /**
   * Percent of used space over space hard quota.
   * @type {computed.number}
   */
  usedOverHardQuotaPercent: computed(
    'spaceSize',
    'status.spaceOccupancy',
    'threshold',
    function usedOverHardQuotaPercent() {
      const {
        spaceSize,
        status,
        threshold,
      } = this.getProperties('spaceSize', 'status', 'threshold');
      const spaceOccupancy = Math.min(get(status, 'spaceOccupancy'), spaceSize);
      return (Math.max(spaceOccupancy - threshold, 0) / spaceSize) * 100;
    }
  ),

  /**
   * Percent of not used space below space soft quota.
   * @type {computed.number}
   */
  notUsedOverHardQuotaPercent: computed(
    'spaceSize',
    'threshold',
    'usedOverHardQuotaPercent',
    function notUsedOverHardQuotaPercent() {
      const {
        spaceSize,
        threshold,
        usedOverHardQuotaPercent,
      } = this.getProperties('spaceSize', 'threshold', 'usedOverHardQuotaPercent');
      return ((spaceSize - threshold) / spaceSize) * 100 -
        usedOverHardQuotaPercent;
    }
  ),

  /**
   * Sets chart elements styles.
   */
  valuesObserver: observer(
    'usedPercent',
    'usedBelowSoftQuotaPercent',
    'notUsedBelowSoftQuotaPercent',
    'usedBelowHardQuotaPercent',
    'notUsedBelowHardQuotaPercent',
    'usedOverHardQuotaPercent',
    'notUsedOverHardQuotaPercent',
    function valuesObserver() {
      const properties = [
        'usedBelowSoftQuotaPercent',
        'notUsedBelowSoftQuotaPercent',
        'usedBelowHardQuotaPercent',
        'notUsedBelowHardQuotaPercent',
        'usedOverHardQuotaPercent',
        'notUsedOverHardQuotaPercent',
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
        _allowBarAnimations,
        usedPercent,
        _oldPercentValues,
      } = this.getProperties(
        '_allowBarAnimations',
        'usedPercent',
        '_oldPercentValues'
      );
      const deltaUsedPercent = usedPercent - _oldPercentValues.usedPercent;
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
            transition: `width ${animationTime}s linear, left ${animationTime}s linear`,
            transitionDelay: `${delay}s`,
          };
        } else {
          transition = {
            transition: 'none',
            transitionDelay: '0s',
          };
        }
        transitions[transitionElements[i]] = transition;
        transitions[transitionElements[i + 1]] = transition;
      }
      properties.forEach((prop, index) => {
        dom.setStyles(
          this.element?.querySelector('.' + classes[index]),
          transitions[prop]
        );
      });
      let percentSum = 0;
      properties.forEach((property, index) => {
        const propertyValue = this.get(property);
        dom.setStyles(this.element?.querySelector('.' + classes[index]), {
          width: propertyValue + '%',
          left: percentSum + '%',
        });
        percentSum += propertyValue;
      });
      const usedWidth = { width: usedPercent + '%' };
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
      dom.setStyles(
        this.element?.querySelectorAll('.used, .pacman-row .used-space, .pacman-cell'),
        standardBarAnimation
      );
      dom.setStyles(
        this.element?.querySelectorAll('.used, .pacman-row .used-space'),
        usedWidth
      );
      properties.forEach((prop) => _oldPercentValues[prop] = this.get(prop));
      _oldPercentValues.usedPercent = usedPercent;
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
      targetSoftQuota,
      threshold,
      onChange,
    } = this.getProperties('targetSoftQuota', 'threshold', 'onChange');
    const values = {
      target: targetSoftQuota,
      threshold: threshold,
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
        targetSoftQuota: target,
        targetForSlider: target,
        threshold: threshold,
        thresholdForSlider: threshold,
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
        threshold: Math.floor(values[1]),
        targetSoftQuota: Math.floor(values[0]),
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
        targetForSlider: Math.floor(values[0]),
        thresholdForSlider: Math.floor(values[1]),
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
              targetSoftQuota: value,
              targetForSlider: value,
            });
            this._change();
          }
          break;
        case 'threshold':
          if (value > target && value <= spaceSize) {
            this.setProperties({
              threshold: value,
              thresholdForSlider: value,
            });
            this._change();
          }
          break;
      }
      run.next(() => this.set('_allowBarAnimations', true));
    },
  },
});
