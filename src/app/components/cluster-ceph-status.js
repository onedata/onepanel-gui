import Component from '@ember/component';
import { computed, get, set, getProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';

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

export default Component.extend(I18n, {
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
   * @type {Ember.ComputedProperty<PromiseObject<Onepanel.CephStatus>>}
   */
  statusProxy: computed(function status() {
    return this.get('cephManager').getStatus();
  }),

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
   * @type {Ember.ComputedProperty<PromiseArray<Object>>}
   */
  osdsUsageProxy: computed(function osdsUsage() {
    return this.get('cephManager').getOsdsWithUsage();
  }),

  /**
   * Array of objects used as a data source for items in OSDs usage section.
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  osdsUsage: computed(
    'osdsUsageProxy.content.{osds.[],usage}',
    function osdsUsage() {
      if (this.get('osdsUsageProxy.isFulfilled')) {
        let {
          osds,
          usage,
        } = getProperties(this.get('osdsUsageProxy.content'), 'osds', 'usage');

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
    }
  ),

  init() {
    this._super(...arguments);

    this.get('osdsUsageProxy')
      .then(() => next(() => safeExec(this, 'autoexpandOsds')));
  },

  /**
   * Performs automatic expand of OSDs usage items
   * @return {undefined}
   */
  autoexpandOsds() {
    const autoexpandOsdsWhenNodesBelow = this.get('autoexpandOsdsWhenNodesBelow');
    for (let i = 1; i < autoexpandOsdsWhenNodesBelow; i++) {
      const ithItemSelector = `.one-collapsible-list-item:nth-child(${i})`;
      this.$(`.osds-usage-container ${ithItemSelector} .one-collapsible-list-item-header`)
        .click();
    }
  },
});
