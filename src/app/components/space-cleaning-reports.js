/**
 * A table (or list in mobile view) for displaying information from space
 * cleaning reports.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// TODO: this can be a prototype of infinite scroll list

import Component from '@ember/component';
import { computed, get, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import ListWatcher from 'onedata-gui-common/utils/list-watcher';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';
import { htmlSafe } from '@ember/string';
import SpaceAutoCleaningReportsUpdater from 'onepanel-gui/utils/space-auto-cleaning-reports-updater';
import I18n from 'onedata-gui-common/mixins/i18n';
import dom from 'onedata-gui-common/utils/dom';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import globals from 'onedata-gui-common/utils/globals';
import {
  destroyDestroyableComputedValues,
  destroyableComputed,
  initDestroyableCache,
} from 'onedata-gui-common/utils/destroyable-computed';

function compareIndex(a, b) {
  const ai = get(a, 'index');
  const bi = get(b, 'index');
  if (ai < bi) {
    return -1;
  } else if (ai > bi) {
    return 1;
  } else {
    return 0;
  }
}

export default Component.extend(I18n, {
  classNames: ['space-cleaning-reports'],

  i18n: service(),
  spaceManager: service(),

  i18nPrefix: 'components.spaceCleaningReports',

  spaceId: undefined,

  /**
   * @type {SpaceAutoCleaningReportsUpdater}
   */
  spaceAutoCleaningReportsUpdater: undefined,

  /**
   * If true, component is rendered in mobile mode.
   * @type {boolean}
   */
  _mobileMode: false,

  /**
   * @type {boolean}
   */
  headerVisible: undefined,

  /**
   * Window resize event handler.
   * @type {computed.Function}
   */
  _resizeEventHandler: computed(function () {
    return () => {
      this.set('_mobileMode', globals.window.innerWidth < 768);
    };
  }),

  rowHeight: computed('_mobileMode', function rowHeight() {
    return this.get('_mobileMode') ? 64 : 44;
  }),

  firstRowHeight: computed(
    'rowHeight',
    'reportsArray._start',
    function firstRowHeight() {
      const _start = this.get('reportsArray._start');
      return _start ? _start * this.get('rowHeight') : 0;
    }
  ),

  firstRowStyle: computed('firstRowHeight', function firstRowStyle() {
    return htmlSafe(`height: ${this.get('firstRowHeight')}px;`);
  }),

  reportsArray: destroyableComputed('spaceId', function reportsArray() {
    const spaceId = this.get('spaceId');
    return ReplacingChunksArray.create({
      fetch: (...fetchArgs) => this.fetchReports(spaceId, ...fetchArgs),
      sortFun: compareIndex,
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
    });
  }),

  noReportsAvailable: computed(
    'reportsArray.{length,isLoading,initialLoad.isPending}',
    function noReportsAvailable() {
      return !this.get('reportsArray.length') &&
        !this.get('reportsArray.initialLoad.isPending') &&
        !this.get('reportsArray.isLoading');
    }
  ),

  bottomLoading: computed('reportsArray.{_fetchNextLock,initialLoad.isPending}',
    function bottomLoading() {
      return this.get('reportsArray._fetchNextLock') ||
        this.get('reportsArray.initialLoad.isPending');
    }
  ),

  toggleReportsUpdater: observer(
    'isCleanEnabled',
    'headerVisible',
    function toggleReportsUpdater() {
      const enable = this.get('headerVisible') && this.get('isCleanEnabled');
      if (this.get('spaceAutoCleaningReportsUpdater.isEnabled') !== enable) {
        this.set('spaceAutoCleaningReportsUpdater.isEnabled', enable);
      }
    }
  ),

  /**
   * Change of a start or end index could be needed after source array length change
   */
  sourceArrayLengthObserver: observer(
    'reportsArray.sourceArray.length',
    async function sourceArrayLengthObserver() {
      await waitForRender();
      this.listWatcher?.scrollHandler();
    }
  ),

  init() {
    initDestroyableCache(this);
    this._super(...arguments);

    const {
      _resizeEventHandler,
      spaceManager,
      spaceId,
      reportsArray,
    } = this.getProperties(
      '_resizeEventHandler',
      'spaceManager',
      'spaceId',
      'reportsArray'
    );

    _resizeEventHandler();
    globals.window.addEventListener('resize', _resizeEventHandler);

    const spaceAutoCleaningReportsUpdater = SpaceAutoCleaningReportsUpdater.create({
      isEnabled: false,
      spaceManager,
      spaceId,
      replacingArray: reportsArray,
      sortFun: compareIndex,
    });

    this.set('spaceAutoCleaningReportsUpdater', spaceAutoCleaningReportsUpdater);
    this.toggleReportsUpdater();
  },

  createListWatcher() {
    return new ListWatcher(
      $('.col-content'),
      '.data-row',
      (items, onTop) => safeExec(this, 'onTableScroll', items, onTop),
      '.table-start-row',
    );
  },

  fetchReports(spaceId, ...fetchArgs) {
    return this.get('spaceManager').getAutoCleaningReports(spaceId, ...fetchArgs);
  },

  /**
   * @param {Array<HTMLElement>} items
   * @param {boolean} headerVisible
   */
  onTableScroll(items, headerVisible) {
    const reportsArray = this.get('reportsArray');
    const sourceArray = get(reportsArray, 'sourceArray');
    const reportsArrayIds = sourceArray.mapBy('id');
    const firstId = items[0] && items[0].getAttribute('data-row-id') || null;
    const lastId = items[items.length - 1] &&
      items[items.length - 1].getAttribute('data-row-id') || null;
    const firstRow = this.element?.querySelector('.first-row');
    let startIndex;
    let endIndex;
    if (firstId === null && get(sourceArray, 'length') !== 0 && firstRow) {
      const rowHeight = this.get('rowHeight');
      const blankStart = dom.offset(firstRow).top * -1;
      const blankEnd = blankStart + globals.window.innerHeight;
      startIndex = Math.floor(blankStart / rowHeight);
      endIndex = Math.floor(blankEnd / rowHeight);
    } else {
      startIndex = reportsArrayIds.indexOf(firstId);
      endIndex = reportsArrayIds.indexOf(lastId, startIndex);
    }
    reportsArray.setProperties({ startIndex, endIndex });
    safeExec(this, 'set', 'headerVisible', headerVisible);
  },

  didInsertElement() {
    this._super(...arguments);
    const listWatcher = this.set('listWatcher', this.createListWatcher());
    (async () => {
      await this.reportsArray.initialLoad;
      await waitForRender();
      listWatcher.scrollHandler();
    })();
  },

  willDestroyElement() {
    try {
      globals.window.removeEventListener('resize', this._resizeEventHandler);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  willDestroy() {
    try {
      destroyDestroyableComputedValues(this);
      this.spaceAutoCleaningReportsUpdater.destroy();
      this.listWatcher.destroy();
    } finally {
      this._super(...arguments);
    }
  },
});
