/**
 * Storage property shown in storages table
 *
 * Please put it in ``cluster-storage-table``.
 *
 * @module components/storage-item
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import _includes from 'lodash/includes';
import _find from 'lodash/find';
import _flatten from 'lodash/flatten';

import STORAGE_TYPES from 'onepanel-gui/utils/cluster-storage/storage-types';
import GENERIC_FIELDS from 'onepanel-gui/utils/cluster-storage/generic-fields';
import LUMA_FIELDS from 'onepanel-gui/utils/cluster-storage/luma-fields';

const {
  Component,
  computed,
} = Ember;

/**
 * Properties of Onepanel.StorageDetails that are common to all storage types
 */
const GENERIC_STORAGE_PROPERTIES = ['id', 'type', ...GENERIC_FIELDS.map(f => f.name)];

/**
 * Properties of Onepanel.StorageDetails that describe LUMA configuration
 */
const LUMA_PROPERTIES = LUMA_FIELDS.map(f => f.name);

/**
 * All fields of "password" type are not shown on storage details
 */
const HIDDEN_STORAGE_PROPERTIES = _flatten(STORAGE_TYPES.map(s => s.fields))
  .filter(f => f.type === 'password')
  .map(f => f.name);

const REJECTED_STORAGE_PROPERTIES = [
  ...GENERIC_STORAGE_PROPERTIES,
  ...LUMA_PROPERTIES,
  ...HIDDEN_STORAGE_PROPERTIES
];

export default Component.extend({
  classNames: ['storage-item'],

  /**
   * To inject.
   * @type {OneCollapsibleListItem}
   */
  listItem: null,

  /**
   * To inject.
   * @type {Ember.Object|ObjectProxy}
   */
  storage: null,

  /**
   * @type {Array.ObjectProxy.Onepanel.SpaceDetails}
   */
  spaces: [],

  /**
   * Readable name of storage typee
   * Eg. Ceph, POSIX, S3, Swift, GlusterFS
   * @type {string}
   */
  storageType: computed('storage.type', function () {
    let st = this.get('storage.type');
    return st && _find(STORAGE_TYPES, s => s.id === st).name;
  }),

  /**
   * List of specific non-empty, type-specific storage properties
   * @type {Array}
   */
  storageProperties: computed('storage.content', function () {
    let storage = this.get('storage');
    // support for ObjectProxy
    if (storage != null && storage.content != null) {
      storage = storage.get('content');
    }
    return storage != null ? Object.keys(storage).filter(
      p => storage[p] != null && !_includes(REJECTED_STORAGE_PROPERTIES, p)
    ) : [];
  }),

  /**
   * List of LUMA-related storage properties
   * @type {Array.string}
   */
  lumaProperties: LUMA_PROPERTIES,

  /**
   * List of spaces supported by this storage
   * @type {Array.Onepanel.SpaceDetails}
   */
  supportedSpaces: computed('spaces.@each.isFulfilled', function () {
    let {
      spaces,
      storage
    } = this.getProperties('spaces', 'storage');

    // support for ObjectProxy
    if (storage != null && storage.content != null) {
      storage = storage.get('content');
    }

    return spaces.filter(spaceProxy => {
      if (spaceProxy.get('isFulfilled')) {
        // if there will be more than one local storage per space, 
        // localStorages array can be used instead of storageId
        let localStorage = spaceProxy.get('content.storageId');
        return localStorage && localStorage === storage.id;
      }
      else {
        return false;
      }
    });
  }),

  translationPrefix: computed('storage.type', function () {
    return `components.storageItem.${this.get('storage.type')}.`;
  }),
});
