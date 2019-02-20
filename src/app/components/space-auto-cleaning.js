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
import { inject } from '@ember/service';
import { Promise } from 'rsvp';
import Onepanel from 'npm:onepanel';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import SpaceAutoCleaningStatusUpdater from 'onepanel-gui/utils/space-auto-cleaning-status-updater';
import { getOwner } from '@ember/application';

const {
  SpaceAutoCleaningConfiguration,
} = Onepanel;

const BLANK_AUTO_CLEANING = {
  enabled: false,
};

export default Component.extend({
  media: inject(),
  spaceManager: inject(),
  globalNotify: inject(),

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

  startNowEnabled: computed(
    'isCleanEnabled',
    'target',
    'status.{spaceOccupancy,inProgress}',
    function () {
      return this.get('isCleanEnabled') &&
        !this.get('status.inProgress') &&
        this.get('target') < this.get('status.spaceOccupancy');
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
      const {
        configureSpaceAutoCleaning,
        isCleanEnabled,
      } = this.getProperties('configureSpaceAutoCleaning', 'isCleanEnabled');
      const newCleanEnabled = !isCleanEnabled;
      const configureReq = Object.assign({},
        this.enabledSettings(), { enabled: newCleanEnabled }
      );
      return configureSpaceAutoCleaning(configureReq);
    },

    barValuesChanged(values) {
      let configureSpaceAutoCleaning = this.get('configureSpaceAutoCleaning');
      let settings = this.get('autoCleaningConfiguration');
      let changedValues = {};
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
        configureSpaceAutoCleaning(changedValues) : Promise.resolve();
    },

    fileConditionsChanged(values) {
      let {
        configureSpaceAutoCleaning,
        autoCleaningConfiguration,
      } = this.getProperties('configureSpaceAutoCleaning', 'autoCleaningConfiguration');
      if (autoCleaningConfiguration && get(autoCleaningConfiguration, 'enabled')) {
        return configureSpaceAutoCleaning({ rules: values });
      } else {
        return Promise.reject();
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
      } = this.getProperties('spaceManager', 'globalNotify', 'spaceId');
      return spaceManager.startCleaning(spaceId)
        .then(() => {
          // only a side effect
          this.get('spaceAutoCleaningStatusUpdater').updateData();
        })
        .catch(error => {
          globalNotify.backendError(
            'manually starting space cleaning',
            error
          );
          throw error;
        });
    },
  },
});
