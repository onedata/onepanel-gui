/**
 * Shows information about ceph pools.
 * 
 * @module components/cluster-ceph-pools
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, getProperties, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(
  I18n,
  createDataProxyMixin('poolsWithUsage'),
  createDataProxyMixin('canCreatePool'), {
    classNames: ['cluster-ceph-pools'],

    cephManager: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.clusterCephPools',

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    pools: computed('poolsWithUsage.{pools.[],usage}', function pools() {
      const {
        pools: poolsList,
        usage,
      } = getProperties(this.get('poolsWithUsage') || {}, 'pools', 'usage');
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
     * Fullfills only when all nedded data is fetched successfully.
     * @type {Ember.ComputedProperty<PromiseObject<any>>}
     */
    loadingProxy: computed(
      'poolsWithUsageProxy.promise',
      'canCreatePoolProxy.promise',
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

    /**
     * @override
     */
    fetchPoolsWithUsage() {
      return this.get('cephManager').getPoolsWithUsage();
    },

    /**
     * @override
     */
    fetchCanCreatePool() {
      return this.get('cephManager').canCreateStorage();
    },
  }
);
