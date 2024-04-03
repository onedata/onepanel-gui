/**
 * Renders a tile with onepanel running services visualisation.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { computed, get } from '@ember/object';
import { union } from '@ember/object/computed';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.clusterNodesTile',

  /**
   * @virtual
   * @type {PromiseObject<Object>}
   */
  clusterConfigurationProxy: undefined,

  /**
   * @type {Array<string>}
   */
  services: Object.freeze([
    'databases',
    'managers',
    'workers',
  ]),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  serviceNames: computed('services', function serviceNames() {
    const services = this.get('services');
    return services.reduce((tObject, serviceName) => {
      tObject[serviceName] = this.t('services.' + serviceName);
      return tObject;
    }, {});
  }),

  /**
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  allNodes: union(
    'clusterConfigurationProxy.cluster.databases.hosts',
    'clusterConfigurationProxy.cluster.managers.hosts',
    'clusterConfigurationProxy.cluster.workers.hosts'
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   * It is an array of objects: {
   *   service: string,
   *   serviceName: string,
   *   boxes: Array<{type: 'ok'|'empty'}>
   * }
   */
  serviceRows: computed(
    'services',
    'serviceNames',
    'allNodes',
    'clusterConfigurationProxy.cluster.{databases.hosts,managers.hosts,workers.hosts}',
    function serviceRows() {
      const {
        services,
        serviceNames,
        allNodes,
        clusterConfigurationProxy,
      } = this.getProperties(
        'services',
        'serviceNames',
        'allNodes',
        'clusterConfigurationProxy'
      );
      if (!get(allNodes, 'length')) {
        return [];
      } else {
        return services.map(service => ({
          service,
          serviceName: get(serviceNames, service),
          boxes: allNodes.map(node => {
            const hasService =
              get(
                clusterConfigurationProxy,
                `cluster.${service}.hosts`
              ).includes(node);
            return {
              type: hasService ? 'ok' : 'empty',
            };
          }),
        }));
      }
    }
  ),
});
