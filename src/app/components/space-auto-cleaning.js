/**
 * A space auto cleaning tab with bar chart, file conditions form and 
 * cleaning reports table.
 *
 * @module components/space-auto-cleaning
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, observer } from '@ember/object';
import { inject } from '@ember/service';
import { Promise } from 'rsvp';
import Onepanel from 'npm:onepanel';
import {
  DISABLE_LOWER_FILE_SIZE_LIMIT,
  DISABLE_UPPER_FILE_SIZE_LIMIT,
  DISABLE_MAX_FILE_NOT_OPENED_HOURS,
} from 'onepanel-gui/utils/space-auto-cleaning-conditions';

const {
  SpaceAutoCleaningSettings,
} = Onepanel;

import SpaceAutoCleaningUpdater from 'onepanel-gui/utils/space-auto-cleaning-updater';

const BLANK_AUTO_CLEANING = {
  enabled: false,
};

export default Component.extend({
  spaceManager: inject(),
  globalNotify: inject(),

  classNames: ['space-auto-cleaning'],

  /**
   * ID of SpaceDetails for which auto cleaning view is rendered
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
   * @type {Onepanel.AutoCleaning}
   */
  autoCleaning: undefined,

  /**
   * @type {SpaceAutoCleaningUpdater}
   */
  spaceAutoCleaningUpdater: undefined,

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
  updateAutoCleaning: () => {},

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isCleanEnabled: computed.readOnly('autoCleaning.enabled'),

  /**
   * Data for file conditions form.
   * @type {computed.Object}
   */
  conditionsFormData: computed(
    'autoCleaning.settings.{lowerFileSizeLimit,upperFileSizeLimit,maxFileNotOpenedHours}',
    function () {
      let settings = this.get('autoCleaning.settings');
      return SpaceAutoCleaningSettings.constructFromObject({
        lowerFileSizeLimit: get(settings, 'lowerFileSizeLimit'),
        upperFileSizeLimit: get(settings, 'upperFileSizeLimit'),
        maxFileNotOpenedHours: get(settings, 'maxFileNotOpenedHours'),
      });
    }
  ),

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
   * Aliased and auto updated from SpaceAutoCleaningUpdater
   * @type {Ember.ComputedProperty<Onepanel.AutoCleaningStatus>}
   */
  status: computed.reads('spaceAutoCleaningUpdater.status'),

  /**
   * Collection of cleaning reports
   * Aliased and auto updated from SpaceAutoCleaningUpdater
   * @type {Ember.ComputedProperty<EmberArray<Onepanel.SpaceAutoCleaningReport>>}
   */
  reports: computed.reads('spaceAutoCleaningUpdater.reports'),

  toggleUpdater: observer('isCleanEnabled', function () {
    const isCleanEnabled = this.get('isCleanEnabled');
    const spaceAutoCleaningUpdater = this.get('spaceAutoCleaningUpdater');
    spaceAutoCleaningUpdater.set('isEnabled', isCleanEnabled);
  }),

  init() {
    this._super(...arguments);
    const {
      autoCleaning,
      spaceManager,
      spaceId,
    } = this.getProperties('autoCleaning', 'spaceManager', 'spaceId');

    // if the component is initialized with blank autoCleaning,
    // we should provide an empty valid autoCleaning
    if (autoCleaning == null) {
      this.set('autoCleaning', BLANK_AUTO_CLEANING);
    }

    const spaceAutoCleaningUpdater = SpaceAutoCleaningUpdater.create({
      isEnabled: false,
      spaceManager,
      spaceId,
    });
    this.set('spaceAutoCleaningUpdater', spaceAutoCleaningUpdater);
    this.toggleUpdater();
  },

  willDestroyElement() {
    try {
      this.get('spaceAutoCleaningUpdater').destroy();
    } finally {
      this._super(...arguments);
    }
  },

  enabledSettings() {
    let settings = this.get('autoCleaning.settings');
    if (settings == null) {
      const spaceSize = this.get('spaceSize');
      settings = SpaceAutoCleaningSettings.constructFromObject({
        lowerFileSizeLimit: DISABLE_LOWER_FILE_SIZE_LIMIT,
        upperFileSizeLimit: DISABLE_UPPER_FILE_SIZE_LIMIT,
        maxFileNotOpenedHours: DISABLE_MAX_FILE_NOT_OPENED_HOURS,
        target: spaceSize,
        threshold: spaceSize,
      });
    }
    return settings;
  },

  actions: {
    toggleCleaning() {
      const {
        updateAutoCleaning,
        isCleanEnabled,
      } = this.getProperties('updateAutoCleaning', 'isCleanEnabled');
      const newCleanEnabled = !isCleanEnabled;
      const spaceReq = {
        enabled: newCleanEnabled,
      };
      if (newCleanEnabled) {
        spaceReq.settings = this.enabledSettings();
      }
      return updateAutoCleaning(spaceReq);
    },

    barValuesChanged(values) {
      let updateAutoCleaning = this.get('updateAutoCleaning');
      let settings = this.get('autoCleaning.settings');
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
        updateAutoCleaning({ settings: changedValues }) : Promise.resolve();
    },

    fileConditionsChanged(values) {
      let {
        updateAutoCleaning,
        autoCleaning,
      } = this.getProperties('updateAutoCleaning', 'autoCleaning');
      if (get(autoCleaning, 'enabled')) {
        return updateAutoCleaning({ settings: values });
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
          const spaceAutoCleaningUpdater = this.get('spaceAutoCleaningUpdater');
          // only a side effect
          spaceAutoCleaningUpdater.fetchCleanStatus();
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
