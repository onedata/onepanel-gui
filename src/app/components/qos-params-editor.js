/**
 * Provides viewer and editor of QOS parameters for storage (but is pretty
 * universal an may by used in the future for another similiar problems)
 *
 * @module components/qos-params-editor
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import EmberObject, { get, set, getProperties, computed, observer } from '@ember/object';
import { A } from '@ember/array';
import { array, raw, not, or, and } from 'ember-awesome-macros';
import { later } from '@ember/runloop';
import _ from 'lodash';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { resolve } from 'rsvp';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

const QosParamRecord = EmberObject.extend({
  /**
   * @type {string}
   */
  key: '',

  /**
   * @type {string}
   */
  value: '',

  /**
   * @type {boolean}
   */
  isEditingKey: false,

  /**
   * If true, then record is treated as unavailable  (e.g. is in the middle 
   * of animation of deleting)
   * @type {boolean}
   */
  isRemoved: false,

  /**
   * If true, animation of creating a record will not be applied to this
   * record. Helpful at the time of first component render, when everything
   * should be done without delays.
   * @type {boolean}
   */
  disableCreateAnimation: false,

  /**
   * True value means, that this record has the same key as some another record
   * @type {boolean}
   */
  isDuplicate: false,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isEmpty: and(not('key'), not('value')),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasValueWithoutKey: computed(
    'key',
    'value',
    function hasValuesWithoutKeys() {
      const {
        key,
        value,
      } = this.getProperties('key', 'value');
      return key === '' && value !== '';
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasKeyError: or('isDuplicate', 'hasValueWithoutKey'),
});

const nodeClearDelay = 500;

export default Component.extend(I18n, {
  classNames: ['qos-params-editor'],
  classNameBindings: ['mode'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.qosParamsEditor',

  /**
   * @virtual
   * @type {Object}
   */
  layoutConfig: undefined,

  /**
   * One of `show`, `create`, `edit`
   * @virtual
   * @type {string}
   */
  mode: 'show',

  /**
   * @type {boolean}
   */
  isFormOpened: true,

  /**
   * Object, that representes key-value pairs with qos parameters.
   * @virtual
   * @type {Object}
   */
  qosParams: undefined,

  /**
   * @type {Function}
   * @param {Object} data changes state object. Has fields `isValid` and
   * `qosParams`.
   * @returns {undefined}
   */
  onChange: notImplementedIgnore,

  /**
   * `qosParams` converted to an array of QosParamRecord
   * @type {Ember.ComputedProperty<Array<QosParamRecord>>}
   */
  paramRecords: computed('qosParams', function paramRecords() {
    const qosParams = this.get('qosParams') || {};
    return Object.keys(qosParams).map(key => ({
      key,
      value: get(qosParams, key),
    }));
  }),

  /**
   * The same as `paramRecords`, but for edition purposes.
   * @type {Ember.ComputedProperty<Ember.A<QosParamRecord>>}
   */
  paramEditRecords: computed(function paramEditRecords() {
    return A();
  }),

  /**
   * `paramEditRecords` without records, that are considered as unavailable
   * (are removed).
   * @type {Ember.ComputedProperty<Ember.A<QosParamRecord>>}
   */
  activeParamEditRecords: array.rejectBy('paramEditRecords', raw('isRemoved')),

  /**
   * If true, all records handled by editor are correct.
   * @type {Ember.ComputedProperty<boolean>}
   */
  isValid: not(array.isAny('activeParamEditRecords', raw('hasKeyError'))),

  modeObserver: observer('mode', 'isFormOpened', function modeObserver() {
    const {
      mode,
      paramRecords,
    } = this.getProperties('mode', 'paramRecords');
    if (mode !== 'show') {
      // Depending on `mode`, clone existing params or use clear array as a state
      // of editor.
      let editRecords;
      if (mode === 'edit') {
        editRecords = A(paramRecords.map(obj => QosParamRecord.create(obj)));
      } else {
        editRecords = A();
      }
      this.addEmptyEditRecord(editRecords, true);
      this.set('paramEditRecords', editRecords);
      this.markDuplicates();
    }
  }),

  init() {
    this._super(...arguments);

    this.modeObserver();
  },

  /**
   * Creates new, empty record that will be appended to the array of
   * `QosParamRecord`s.
   * @param {Array<QosParamRecord>} [recordsArray=undefined] destination array
   *   for new record. If no array is provided, `paramEditRecords` will be used.
   * @param {boolean} [disableAnimation=false] if true, creating animation
   *   will be disabled
   * @returns {QosParamRecord} created record
   */
  addEmptyEditRecord(recordsArray = undefined, disableAnimation = false) {
    if (!recordsArray) {
      recordsArray = this.get('paramEditRecords');
    }

    const newRecord = QosParamRecord.create({
      isEditingKey: true,
      disableCreateAnimation: disableAnimation,
    });
    recordsArray.pushObject(newRecord);

    return newRecord;
  },

  /**
   * Removes last edition record, if the one before last record has an empty key.
   * This operation is made to make sure, that only one empty record is at the end
   * of the form.
   * @returns {boolean} true, if last record has been removed
   */
  removeLastEditRecordIfNeeded() {
    const editRecords = this.get('activeParamEditRecords');
    const editRecordsLength = get(editRecords, 'length');
    const oneBeforeLastRecord = editRecords.objectAt(editRecordsLength - 2);
    const lastRecord = editRecords.objectAt(editRecordsLength - 1);

    if (oneBeforeLastRecord &&
      get(oneBeforeLastRecord, 'key') == '' &&
      get(lastRecord, 'isEmpty')) {
      this.removeEditRecord(lastRecord);
      return true;
    } else {
      return false;
    }
  },

  /**
   * Marks record as removed. It will be removed from `paramEditRecords` after
   * `nodeClearDelay` ms
   * @param {QosParamRecord} record 
   */
  removeEditRecord(record) {
    set(record, 'isRemoved', true);
    later(this, 'removeEditRecordNode', record, nodeClearDelay);
  },

  /**
   * Removes qos record permanently. Should be used only via `removeEditRecord`
   * method
   * @param {QosParamRecord} record
   * @returns {Ember.A<QosParamRecord>} new version of qos records
   */
  removeEditRecordNode(record) {
    return safeExec(
      this,
      () => this.get('paramEditRecords').removeObject(record)
    );
  },

  /**
   * Marks edition records as duplicates if some of them has the same key.
   * @returns {undefined}
   */
  markDuplicates() {
    const editRecords = this.get('activeParamEditRecords');
    const keys = editRecords.mapBy('key').without('');
    const keyOccurences = _.countBy(keys);
    const duplicatedKeys = Object.keys(keyOccurences)
      .filter(key => get(keyOccurences, key) > 1);
    editRecords.forEach(record => set(
      record,
      'isDuplicate',
      duplicatedKeys.includes(get(record, 'key'))
    ));
  },

  /**
   * Removes all empty qos records from the end of the form except the first one,
   * that is after record with non empty key.
   * @returns {undefined}
   */
  removeEmptyEditRecordsFromEnd() {
    const editRecords = this.get('activeParamEditRecords');
    const editRecordsLength = get(editRecords, 'length');

    for (let i = editRecordsLength - 2; i >= 0; i--) {
      const prevRecord = editRecords.objectAt(i);
      const record = editRecords.objectAt(i + 1);

      if (get(prevRecord, 'key') === '' && get(record, 'isEmpty')) {
        this.removeEditRecord(record);
      } else {
        break;
      }
    }
  },

  /**
   * Propagates information about values change with onChange virtual method.
   * @returns {undefined}
   */
  notifyChange() {
    const {
      isValid,
      activeParamEditRecords,
      onChange,
    } = this.getProperties('isValid', 'activeParamEditRecords', 'onChange');
    let qosParams;
    if (isValid) {
      qosParams = activeParamEditRecords
        .filterBy('key')
        .reduce((obj, record) => {
          const {
            key,
            value,
          } = getProperties(record, 'key', 'value');
          set(obj, key, value);
          return obj;
        }, {});
    } else {
      qosParams = null;
    }
    const notificationData = {
      isValid,
      qosParams,
    };
    onChange(notificationData);
  },

  actions: {
    keyEdit(record) {
      const {
        isEditingKey,
        hasKeyError,
        key,
      } = getProperties(record, 'isEditingKey', 'hasKeyError', 'key');
      if (!(isEditingKey && (hasKeyError || key === ''))) {
        set(record, 'isEditingKey', !isEditingKey);
      }
    },
    keyChanged(record, key) {
      const editRecords = this.get('activeParamEditRecords');
      const editRecordsLength = get(editRecords, 'length');
      const recordIndex = editRecords.indexOf(record);

      set(record, 'key', key);

      if (recordIndex === editRecordsLength - 1 && key !== '') {
        this.addEmptyEditRecord();
      } else {
        this.removeLastEditRecordIfNeeded(record);
      }
      this.markDuplicates();
      this.notifyChange();
      return resolve();
    },
    inputLostFocus(fieldName, record) {
      const {
        hasKeyError,
        key,
      } = getProperties(record, 'hasKeyError', 'key');
      if (fieldName === 'key' && !hasKeyError && key !== '') {
        set(record, 'isEditingKey', false);
      }
      // Empty records are preserved until focus lost
      this.removeEmptyEditRecordsFromEnd();
    },
    valueChanged(record, event) {
      set(record, 'value', event.target.value);
      // If value is empty, then some empty record may be removed from the end 
      this.removeLastEditRecordIfNeeded(record);
      this.notifyChange();
    },
    removeRecord(record) {
      this.removeEditRecord(record);
      this.removeEmptyEditRecordsFromEnd();
      this.markDuplicates();
      this.notifyChange();
    },
  },
});
