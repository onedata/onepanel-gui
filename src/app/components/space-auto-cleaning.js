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
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

const {
  SpaceAutoCleaningConfiguration,
} = Onepanel;

const BLANK_AUTO_CLEANING = {
  enabled: false,
};

const autoCleaningButtonTimeout = 1000;

export default Component.extend(I18n, {
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
   * @returns {undefined}
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
   * If true, start manual-cleaning button is disabled
   * @type {boolean}
   */
  disableStartButton: false,

  /**
   * Last triggered action.It may be: 'stop', 'start' or undefined.
   * This value is changed to undefined when auto cleaning is finished or stopped.
   * @type {string}
   */
  lastTriggeredAction: undefined,

  /**
   * Cleaning status
   * Aliased and auto updated from SpaceAutoCleaningStatusUpdater
   * @type {Ember.ComputedProperty<Onepanel.AutoCleaningStatus>}
   */
  status: reads('spaceAutoCleaningStatusUpdater.status'),

  displayStartButton: computed(
    'status.lastRunStatus',
    function displayStartButton() {
      const lastRunStatus = this.get('status.lastRunStatus');
      return lastRunStatus !== 'active' && lastRunStatus !== 'cancelling';
    }),

  enableStartButton: computed(
    'isCleanEnabled',
    'target',
    'status.spaceOccupancy',
    function enableStartButton() {
      return this.get('isCleanEnabled') &&
        this.get('target') < this.get('status.spaceOccupancy');
    }),

  disableManualCleaningButton: computed(
    'status.lastRunStatus',
    'displayStartButton',
    'enableStartButton',
    'disableStartButton',
    'lastTriggeredAction',
    function disableManualCleaningButton() {
      return (this.get('displayStartButton') && !this.get('enableStartButton')) ||
        this.get('status.lastRunStatus') === 'cancelling' ||
        this.get('disableStartButton') ||
        this.get('lastTriggeredAction') === 'stop';
    }),

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

  resetLastTriggerAction: observer(
    'status.lastRunStatus',
    function resetLastTriggerAction() {
      if (
        this.get('lastTriggeredAction') === 'stop' &&
        this.get('status.lastRunStatus') !== 'cancelled'
      ) {
        this.set('lastTriggeredAction', undefined);
      }
    }
  ),

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
    } else {
      this.set('target', get(autoCleaningConfiguration, 'target'));
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

  /**
   * @param {String} action One of: 'start', 'stop'
   * @returns {Promise}
   */
  toggleManualCleaning(action) {
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
    return spaceManager[`${action}Cleaning`](spaceId)
      .then(() => {
        // only a side effect
        spaceAutoCleaningStatusUpdater.updateData();
      })
      .then(() => {
        if (action === 'start') {
          this.setProperties({
            lastTriggeredAction: action,
            disableStartButton: true,
          });
          later(this, () => {
            safeExec(this, 'set', 'disableStartButton', false);
          }, autoCleaningButtonTimeout);
        } else {
          this.set('lastTriggeredAction', action);
        }
      })
      .catch(error => {
        globalNotify.backendError(
          this.t(action + 'ManualCleaning'),
          error
        );
        throw error;
      });
  },

  actions: {
    toggleAutoCleaning() {
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
      return this.toggleManualCleaning('start');
    },

    /**
     * Manual space cleaning stop
     * @returns {Promise<undefined|any>} resolves when stopping cleaning
     *  on backend succeeds
     */
    stopCleaning() {
      return this.toggleManualCleaning('stop');
    },
  },
});
