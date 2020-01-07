/**
 * Information about Ceph cluster
 *
 * @module components/content-cluster-ceph
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

const allowedTabs = ['status', 'configuration', 'pools'];

export default Component.extend(
  createDataProxyMixin('isDeployed'),
  createDataProxyMixin('configuration'),
  I18n, {
    classNames: ['content-clusters-ceph'],

    i18n: service(),
    cephManager: service(),
    navigationState: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentClustersCeph',

    /**
     * @type {string}
     */
    activeTab: 'status',

    /**
     * Tab id is in format `elementId-tab`, where tab value corresponds to
     * activeTab property possible values.
     * @type {Ember.ComputedProperty<string>}
     */
    activeTabId: computed('elementId', 'activeTab', function activeTabId() {
      const {
        elementId,
        activeTab,
      } = this.getProperties('elementId', 'activeTab');
      return `${elementId}-${activeTab}`;
    }),

    activeTabObserver: observer('activeTab', function () {
      this.redirectItTabIsNotCorrect();
    }),

    init() {
      this._super(...arguments);

      this.activeTabObserver();
    },

    redirectItTabIsNotCorrect() {
      if (!allowedTabs.includes(this.get('activeTab'))) {
        next(() => safeExec(this, () => this.changeTab(allowedTabs[0])));
      }
    },

    /**
     * @override
     */
    fetchIsDeployed() {
      return this.get('cephManager').isDeployed();
    },

    /**
     * @override
     */
    fetchConfiguration() {
      return this.get('cephManager').getConfiguration();
    },

    /**
     * @param {string} tab
     * @returns {undefined}
     */
    changeTab(tab) {
      if (allowedTabs.includes(tab)) {
        this.get('navigationState').setAspectOptions({
          tab: tab,
        });
      }
    },

    actions: {
      tabChange(tabId) {
        const tab = tabId.split('-')[1];
        this.changeTab(tab);
      },
    },
  }
);
