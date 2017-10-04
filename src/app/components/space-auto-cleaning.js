/**
 * A space auto cleaning tab with bar chart, file conditions form and 
 * cleaning reports table.
 *
 * @module components/space-auto-cleaning
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import EmberObject from '@ember/object';
import { computed, get } from '@ember/object';
import { Promise } from 'rsvp';


export default Component.extend({
  classNames: ['space-auto-cleaning'],

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
   * Action called on autocleaning settings change.
   * @virtual
   * @type {Function}
   */
  updateAutoCleaning: () => {},

  /**
   * Cleaning status.
   * @virtual
   * @type {Onepanel.AutoCleaningStatus}
   */
  status: computed('spaceSize', function () {
    // FIXME computed only for testing purposes. It should be injected.
    return {
      isWorking: true,
      spaceUsed: this.get('spaceSize') * 0.75,
    };
  }),

  /**
   * Data for bar chart.
   * @type {computed.Ember.Object}
   */
  barData: computed(
    'autoCleaning.settings.{spaceSoftQuota,spaceHardQuota}',
    'status.{isWorking,spaceUsed}',
    'spaceSize',
    function () {
      let {
        autoCleaning,
        status,
        spaceSize,
      } = this.getProperties('autoCleaning', 'status', 'spaceSize');
      return EmberObject.create({
        isWorking: get(status, 'isWorking'),
        spaceSize,
        spaceUsed: get(status, 'spaceUsed'),
        spaceSoftQuota: get(autoCleaning, 'settings.spaceSoftQuota'),
        spaceHardQuota: get(autoCleaning, 'settings.spaceHardQuota'),
      });
    }
  ),

  /**
   * Data for file conditions form.
   * @type {computed.Object}
   */
  conditionsFormData: computed(
    'autoCleaning.settings.{fileSizeGreaterThan,fileSizeLesserThan,fileTimeNotActive}',
    function () {
      let settings = this.get('autoCleaning.settings');
      return {
        fileSizeGreaterThan: get(settings, 'fileSizeGreaterThan'),
        fileSizeLesserThan: get(settings, 'fileSizeLesserThan'),
        fileTimeNotActive: get(settings, 'fileTimeNotActive'),
      };
    }
  ),
  // FIXME replace with real reports data
  data: [{
    startedAt: new Date(),
    stoppedAt: new Date(),
    releasedSize: 10485760,
    plannedReleasedSize: 20485760,
    filesNumber: 24,
    status: 'success',
  }, {
    startedAt: new Date(),
    stoppedAt: new Date(),
    releasedSize: 80485760,
    plannedReleasedSize: 20485760,
    filesNumber: 18,
    status: 'failure',
  }],

  actions: {
    toggleCleaning() {
      let {
        updateAutoCleaning,
        autoCleaning,
      } = this.getProperties('updateAutoCleaning', 'autoCleaning');
      updateAutoCleaning({ enabled: !get(autoCleaning, 'enabled') });
    },
    barValuesChanged(values) {
      let updateAutoCleaning = this.get('updateAutoCleaning');
      let settings = this.get('autoCleaning.settings');
      let changedValues = {};
      ['spaceSoftQuota', 'spaceHardQuota'].forEach((fieldName) => {
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
