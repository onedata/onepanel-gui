/**
 * Shows information about ceph pools.
 * 
 * @module components/cluster-ceph-pools
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, getProperties, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend(I18n, {
  classNames: ['cluster-ceph-pools'],

  cephManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.clusterCephPools',

  /**
   * @type {Ember.ComputedProperty<PromiseObject>}
   */
  poolsWithUsageProxy: computed(function poolsWithUsageProxy() {
    return this.get('cephManager').getPoolsWithUsage();
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  pools: computed('poolsWithUsageProxy.content.{pools.[],usage}', function pools() {
    const {
      pools: poolsList,
      usage,
    } = getProperties(this.get('poolsWithUsageProxy'), 'pools', 'usage');
    if (poolsList && get(poolsList, 'length')) {
      return poolsList.map(pool => {
        const preparedPool = _.cloneDeep(pool);
        const poolUsage = _.cloneDeep(usage[get(pool, 'name')]);
        set(preparedPool, 'usage', poolUsage);
        return preparedPool;
      });
    } else {
      return [];
    }
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseObject<boolean>>}
   */
  canCreatePoolProxy: computed(function canCreatePoolProxy() {
    return this.get('cephManager').canCreateStorage();
  }),

  /**
   * Fullfills only when all nedded data is fetched successfully.
   * @type {Ember.ComputedProperty<PromiseObject<any>>}
   */
  loadingProxy: computed(
    'poolsWithUsageProxy',
    'canCreatePoolProxy',
    function loadingProxy() {
      const {
        poolsWithUsageProxy,
        canCreatePoolProxy,
      } = this.getProperties('poolsWithUsageProxy', 'canCreatePoolProxy');
      return PromiseObject.create({
        promise: Promise.all([
          poolsWithUsageProxy,
          canCreatePoolProxy,
        ]),
      });
    }
  ),
});
