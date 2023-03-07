/**
 * Shows information about ceph cluster status.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, set, getProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import $ from 'jquery';

const levelToAlertLevel = {
  ok: 'success',
  warning: 'warning',
  error: 'danger',
};

const levelToIcon = {
  ok: 'checkbox-filled',
  warning: 'checkbox-filled-warning',
  error: 'checkbox-filled-x',
};

export default Component.extend(
  I18n,
  createDataProxyMixin('status'),
  createDataProxyMixin('osdsUsage'), {
    classNames: ['cluster-ceph-status'],

    cephManager: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.clusterCephStatus',

    /**
     * When number of nodes is below this value, then all nodes will be expaned by
     * default in OSDs usage section.
     * @type {number}
     */
    autoexpandOsdsWhenNodesBelow: 4,

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    statusMessage: computed('statusProxy.level', function statusMessage() {
      const level = this.get('statusProxy.level');
      return this.t(`statusMessages.${level}`);
    }),

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    statusIcon: computed('statusProxy.level', function statusIcon() {
      return levelToIcon[this.get('statusProxy.level')] || 'ceph';
    }),

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    alertLevel: computed('statusProxy.level', function alertLevel() {
      return levelToAlertLevel[this.get('statusProxy.level')] || 'info';
    }),

    /**
     * Array of objects used as a data source for items in OSDs usage section.
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    osdsUsagePerHost: computed('osdsUsage.{osds.[],usage}', function osdsUsage() {
      const osdsUsageData = this.get('osdsUsage');
      if (osdsUsageData) {
        let {
          osds,
          usage,
        } = getProperties(osdsUsageData, 'osds', 'usage');

        osds = _.cloneDeep(osds);
        usage = _.cloneDeep(usage);

        osds.forEach(osd => set(osd, 'usage', usage[get(osd, 'id')]));

        const groupedOsds = _.groupBy(osds, osd => get(osd, 'host'));
        const groupedOsdsAsArray = Object.keys(groupedOsds).map(host => ({
          host,
          osds: groupedOsds[host],
        }));
        return groupedOsdsAsArray;
      } else {
        return [];
      }
    }),

    init() {
      this._super(...arguments);

      this.get('osdsUsageProxy')
        .then(() => next(() => safeExec(this, 'autoexpandOsds')));
    },

    /**
     * @override
     */
    fetchStatus() {
      return this.get('cephManager').getStatus();
    },

    /**
     * @override
     */
    fetchOsdsUsage() {
      return this.get('cephManager').getOsdsWithUsage();
    },

    /**
     * Performs automatic expand of OSDs usage items
     * @returns {undefined}
     */
    autoexpandOsds() {
      const {
        element,
        autoexpandOsdsWhenNodesBelow,
      } = this.getProperties('element', 'autoexpandOsdsWhenNodesBelow');
      for (let i = 1; i < autoexpandOsdsWhenNodesBelow; i++) {
        const ithItemSelector = `.one-collapsible-list-item:nth-child(${i})`;
        $(element).find(
          `.osds-usage-container ${ithItemSelector} .one-collapsible-list-item-header`
        ).click();
      }
    },
  }
);
