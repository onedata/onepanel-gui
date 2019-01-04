/**
 * Renders a tile with onepanel running services visualisation.
 *
 * @module components/cluster-nodes-title
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// FIXME add "More" link

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { union } from '@ember/object/computed';

export default Component.extend(I18n, {
  tagName: '',

  configurationManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.clusterNodesTile',

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
   * @type {Ember.ComputedProperty<PromiseObject<Object>>}
   */
  clusterConfiguration: computed(function clusterConfiguration() {
    return this.get('configurationManager').getClusterDetails();
  }),

  /**
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  allNodes: union(
    'clusterConfiguration.cluster.databases.hosts',
    'clusterConfiguration.cluster.managers.hosts',
    'clusterConfiguration.cluster.workers.hosts'
  ),

  /**
   * @type {@Ember.ComputedProperty<Array<Object>>}
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
    'clusterConfiguration.cluster.{databases.hosts,managers.hosts,workers.hosts}',
    function serviceRows () {
      const {
        services,
        serviceNames,
        allNodes,
        clusterConfiguration,
      } = this.getProperties(
        'services',
        'serviceNames',
        'allNodes',
        'clusterConfiguration'
      );
      if (!get(allNodes, 'length')) {
        return [];
      } else {
        return services.map(service => ({
          service,
          serviceName: get(serviceNames, service),
          boxes: allNodes.map(node => {
            const hasService =
              get(clusterConfiguration, `cluster.${service}.hosts`).includes(node);
            return {
              type: hasService ? 'ok' : 'empty',
            };
          }),
        }));
      }
    }
  ),
});
