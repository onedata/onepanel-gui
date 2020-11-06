/**
 * A space auto-cleaning tab with bar chart, file conditions form and 
 * cleaning reports table.
 *
 * @module components/space-auto-cleaning
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { computed, get, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { resolve, reject } from 'rsvp';
import Onepanel from 'npm:onepanel';
import { later } from '@ember/runloop';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import SpaceAutoCleaningStatusUpdater from 'onepanel-gui/utils/space-auto-cleaning-status-updater';
import { getOwner } from '@ember/application';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const {
  SpaceAutoCleaningConfiguration,
} = Onepanel;

const BLANK_AUTO_CLEANING = {
  enabled: false,
};

export default Component.extend(I18n, {
  media: service(),
  spaceManager: service(),
  globalNotify: service(),

  i18nPrefix: 'components.spaceAutoCleaning',

  classNames: ['space-auto-cleaning'],

  /**
   * ID of SpaceDetails for which auto-cleaning view is rendered
   * @virtual
   * @type {string}
   */
  spaceId: undefined,

  /**
   * Space size.
   * @virtual
   * @type {number}
   */
  spaceSize: 0,

  /**
   * @virtual
   * @type {Onepanel.SpaceAutoCleaningConfiguration}
   */
  autoCleaningConfiguration: undefined,

  /**
   * @type {SpaceAutoCleaningStatusUpdater}
   */
  spaceAutoCleaningStatusUpdater: undefined,

  /**
   * Cleaning target bytes (updated by event)
   * @type {number}
   */
  target: undefined,

  /**
   * Cleaning threshold bytes (updated by event)
   * @type {number}
   */
  threshold: undefined,

  /**
   * Action called on autocleaning settings change.
   * @virtual
   * @type {Function}
   */
  configureSpaceAutoCleaning: notImplementedReject,

  /**
   * Action called on space occupancy change.
   * @virtual
   * @type {Function}
   * @param {number} spaceOccupancy
   * @return {undefined}
   */
  spaceOccupancyChanged: () => {},

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isCleanEnabled: reads('autoCleaningConfiguration.enabled'),

  /**
   * Data for file conditions form.
   * @type {computed.Object}
   */
  conditionsFormData: reads('autoCleaningConfiguration.rules'),

  /**
   * If true, disable cleaning button
   * @type {boolean}
   */
  disableCleaningButton: false,

  /**
   * If true, stop button is clicked
   * @type {boolean}
   */
  stopButtonClick: true,

  startNowEnabled: computed(
    'isCleanEnabled',
    'target',
    'status.{spaceOccupancy,inProgress}',
    function () {
      return this.get('isCleanEnabled') &&
        !this.get('status.inProgress') &&
        this.get('target') < this.get('status.spaceOccupancy');
    }),

  displayStartButton: computed(
    'isCleanEnabled',
    'status.{spaceOccupancy,inProgress}',
    function () {
      return this.get('isCleanEnabled') &&
        !this.get('status.inProgress');
    }),

  /**
   * Cleaning status
   * Aliased and auto updated from SpaceAutoCleaningStatusUpdater
   * @type {Ember.ComputedProperty<Onepanel.AutoCleaningStatus>}
   */
  status: reads('spaceAutoCleaningStatusUpdater.status'),

  toggleStatusUpdater: observer('isCleanEnabled', function toggleStatusUpdater() {
    const enable = this.get('isCleanEnabled');
    if (this.get('spaceAutoCleaningStatusUpdater.isEnabled') !== enable) {
      this.set('spaceAutoCleaningStatusUpdater.isEnabled', enable);
    }
  }),

  cleaningStatusObserver: observer('status.spaceOccupancy', function () {
    const status = this.get('status');
    const spaceOccupancy = status ? get(status, 'spaceOccupancy') : null;
    if (typeof spaceOccupancy === 'number') {
      this.get('spaceOccupancyChanged')(spaceOccupancy);
    }
  }),

  init() {
    this._super(...arguments);
    const {
      autoCleaningConfiguration,
      spaceId,
    } = this.getProperties('autoCleaningConfiguration', 'spaceId');

    // if the component is initialized with blank autoCleaningConfiguration,
    // we should provide an empty valid autoCleaningConfiguration
    if (autoCleaningConfiguration == null) {
      this.set('autoCleaning', BLANK_AUTO_CLEANING);
    }

    const spaceAutoCleaningStatusUpdater =
      SpaceAutoCleaningStatusUpdater.create(
        getOwner(this).ownerInjection(), {
          isEnabled: false,
          spaceId,
        }
      );

    this.set('spaceAutoCleaningStatusUpdater', spaceAutoCleaningStatusUpdater);
    this.toggleStatusUpdater();
  },

  willDestroyElement() {
    try {
      this.get('spaceAutoCleaningStatusUpdater').destroy();
    } finally {
      this._super(...arguments);
    }
  },

  handleConfigureSpaceAutoCleaning(...args) {
    const {
      configureSpaceAutoCleaning,
      globalNotify,
    } = this.getProperties('configureSpaceAutoCleaning', 'globalNotify');
    return configureSpaceAutoCleaning(...args)
      .catch((error) => {
        globalNotify.backendError(
          this.t('configuringAutoCleaning'),
          error
        );
        throw error;
      });
  },

  enabledSettings() {
    let autoCleaningConfiguration = this.get('autoCleaningConfiguration');
    if (autoCleaningConfiguration == null) {
      const spaceSize = this.get('spaceSize');
      autoCleaningConfiguration = SpaceAutoCleaningConfiguration.constructFromObject({
        target: spaceSize,
        threshold: spaceSize,
      });
    }
    return autoCleaningConfiguration;
  },

  actions: {
    toggleCleaning() {
      const newCleanEnabled = !this.get('isCleanEnabled');
      const configureReq = Object.assign({},
        this.enabledSettings(), { enabled: newCleanEnabled }
      );
      return this.handleConfigureSpaceAutoCleaning(configureReq);
    },

    barValuesChanged(values) {
      const settings = this.get('autoCleaningConfiguration');
      const changedValues = {};
      ['target', 'threshold'].forEach((fieldName) => {
        const value = values[fieldName];
        if (value != null) {
          this.set(fieldName, value);
        }
        if (value !== get(settings, fieldName)) {
          changedValues[fieldName] = value;
        }
      });
      return Object.keys(changedValues).length > 0 ?
        this.handleConfigureSpaceAutoCleaning(changedValues) : resolve();
    },

    fileConditionsChanged(values) {
      const autoCleaningConfiguration = this.get('autoCleaningConfiguration');
      if (autoCleaningConfiguration && get(autoCleaningConfiguration, 'enabled')) {
        return this.handleConfigureSpaceAutoCleaning({ rules: values });
      } else {
        return reject();
      }
    },

    /**
     * Manual space cleaning start
     * @returns {Promise<undefined|any>} resolves when starting cleaning
     *  on backend succeeds
     */
    startCleaning() {
      const {
        spaceManager,
        globalNotify,
        spaceId,
        spaceAutoCleaningStatusUpdater,
      } = this.getProperties(
        'spaceManager',
        'globalNotify',
        'spaceId',
        'spaceAutoCleaningStatusUpdater'
      );
      this.set('disableCleaningButton', true);
      this.set('displayStartButton', false);
      return spaceManager.startCleaning(spaceId)
        .then(() => {
          // only a side effect
          spaceAutoCleaningStatusUpdater.updateData();
        })
        .then(() => {
          later(this, () => {
            this.set('disableCleaningButton', false);
          }, 1000);
        })
        .catch(error => {
          globalNotify.backendError(
            this.t('manuallyStartingCleaning'),
            error
          );
          throw error;
        });

    },

    stopCleaning() {
      const {
        spaceManager,
        globalNotify,
        spaceId,
        spaceAutoCleaningStatusUpdater,
      } = this.getProperties(
        'spaceManager',
        'globalNotify',
        'spaceId',
        'spaceAutoCleaningStatusUpdater'
      );
      this.set('disableCleaningButton', true);
      this.set('displayStartButton', true);
      return spaceManager.stopCleaning(spaceId)
        .then(() => {
          // only a side effect
          spaceAutoCleaningStatusUpdater.updateData();
        })
        .then(() => {
          later(this, () => {
            this.set('disableCleaningButton', false);
          }, 10000);
        })
        .catch(error => {
          globalNotify.backendError(
            this.t('manuallyStartingCleaning'),
            error
          );
          throw error;
        });
    },
  },
});
