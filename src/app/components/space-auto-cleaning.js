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

import SpaceAutoCleaningUpdater from 'onepanel-gui/utils/space-auto-cleaning-updater';

const BLANK_AUTO_CLEANING = {
  enabled: false,
};

export default Component.extend({
  spaceManager: inject(),

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
    'autoCleaning.settings.{fileSizeGreaterThan,fileSizeLessThan,fileNotActiveHours}',
    function () {
      let settings = this.get('autoCleaning.settings');
      return {
        fileSizeGreaterThan: get(settings, 'fileSizeGreaterThan'),
        fileSizeLessThan: get(settings, 'fileSizeLessThan'),
        fileNotActiveHours: get(settings, 'fileNotActiveHours'),
      };
    }
  ),

  /**
   * Cleaning status
   * Aliased and auto updated from SpaceAutoCleaningUpdater
   * @type {Ember.ComputedProperty<Onepanel.AutoCleaningStatus>}
   */
  status: computed.reads('spaceAutoCleaningUpdater.status'),

  /**
   * Collection of cleaning reports
   * Aliased and auto updated from SpaceAutoCleaningUpdater
   * @type {Ember.ComputedProperty<Array<Onepanel.SpaceAutoCleaningReport>>}
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

  actions: {
    toggleCleaning() {
      const {
        updateAutoCleaning,
        isCleanEnabled,
      } = this.getProperties('updateAutoCleaning', 'isCleanEnabled');
      return updateAutoCleaning({ enabled: !isCleanEnabled });
    },
    barValuesChanged(values) {
      let updateAutoCleaning = this.get('updateAutoCleaning');
      let settings = this.get('autoCleaning.settings');
      let changedValues = {};
      ['target', 'threshold'].forEach((fieldName) => {
        if (values[fieldName] !== get(settings, fieldName)) {
          changedValues[fieldName] = values[fieldName];
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
        updateAutoCleaning({ settings: values });
      }
    },
  },
});
