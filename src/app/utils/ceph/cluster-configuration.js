/**
 * Class that represents whole ceph cluster configuration.
 * 
 * @module utils/ceph/cluster-configuration
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get, getProperties } from '@ember/object';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import cephOsdIdGenerator from 'onepanel-gui/utils/ceph/osd-id-generator';
import _ from 'lodash';
import CephNodeConfiguration from 'onepanel-gui/utils/ceph/node-configuration';
import CephClusterMainConfiguration from 'onepanel-gui/utils/ceph/cluster-main-configuration';

export default EmberObject.extend({
  /**
   * Contains global params of the Ceph cluster.
   * @type {Utils/Ceph/ClusterMainConfiguration}
   */
  mainConfiguration: computed(function mainConfiguration() {
    return CephClusterMainConfiguration.create();
  }),

  /**
   * @type {Utils/Ceph/OsdIdGenerator}
   */
  osdIdGenerator: undefined,

  /**
   * List of Ceph cluster nodes.
   * @type {Ember.ComputedProperty<Array<Utils/Ceph/NodeConfiguration>>}
   */
  nodes: computed(function nodes() {
    return A();
  }),

  /**
   * Is true if there is at least one OSD service available in
   * cluster configuration.
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasOsd: computed('nodes.@each.hasOsd', function hasOsd() {
    return this.get('nodes').isAny('hasOsd');
  }),

  /**
   * Is true if there is at least one manager & monitor services available in
   * cluster configuration.
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasManagerMonitor: computed(
    'nodes.@each.hasManagerMonitor',
    function hasManagerMonitor() {
      return this.get('nodes').isAny('hasManagerMonitor');
    }
  ),

  /**
   * If true, whole Ceph cluster configuration has valid values.
   * @type {Ember.ComputedProperty<boolean>}
   */
  isValid: computed(
    'hasOsd',
    'hasManagerMonitor',
    'nodes.@each.isValid',
    'mainConfiguration.isValid',
    function isValid() {
      const {
        nodes,
        hasOsd,
        hasManagerMonitor,
        mainConfiguration,
      } = this.getProperties(
        'nodes',
        'hasOsd',
        'hasManagerMonitor',
        'mainConfiguration'
      );
      return nodes.every(node => get(node, 'isValid')) && hasOsd && hasManagerMonitor &&
        get(mainConfiguration, 'isValid');
    }
  ),

  init() {
    this._super(...arguments);
    this.set(
      'osdIdGenerator',
      cephOsdIdGenerator.create(getOwner(this).ownerInjection())
    );
  },

  /**
   * Creates new cluster node and adds it to the configuration.
   * @param {string} host 
   * @returns {Utils/Ceph/NodeConfiguration}
   */
  addNode(host) {
    const {
      nodes,
      osdIdGenerator,
    } = this.getProperties('nodes', 'osdIdGenerator');
    const existingNode = nodes.findBy('host', host);
    if (existingNode) {
      return existingNode;
    } else {
      const node = CephNodeConfiguration.create(getOwner(this).ownerInjection(), {
        host,
        osdIdGenerator,
      });
      nodes.pushObject(node);
      return node;
    }
  },

  /**
   * Removes node by host from the configuration.
   * @param {string} host
   * @returns {boolean} whether or not node with given host exists
   */
  removeNodeByHost(host) {
    const nodes = this.get('nodes');
    const node = nodes.findBy('host', host);
    if (node) {
      nodes.removeObject(node);
    }
    return !!node;
  },

  /**
   * Fills in configuration with given data.
   * @param {Object} newConfig 
   * @returns {undefined}
   */
  fillIn(newConfig) {
    const {
      nodes,
      mainConfiguration,
    } = this.getProperties('nodes', 'mainConfiguration');
    const {
      managers,
      monitors,
      osds,
    } = getProperties(newConfig, 'managers', 'monitors', 'osds');
    mainConfiguration.fillIn(newConfig);
    const hosts = _.concat(managers, monitors, osds).mapBy('host').uniq();
    hosts.forEach(host => {
      const node = this.addNode(host);
      node.fillIn(newConfig);
    });
    nodes.forEach(node => {
      if (!hosts.includes(get(node, 'host'))) {
        nodes.removeObject(node);
      }
    });
  },

  /**
   * Creates raw object with configuration data. It is compatible with format
   * used by backend.
   * @returns {Object}
   */
  toRawConfig() {
    const {
      nodes,
      mainConfiguration,
    } = this.getProperties('nodes', 'mainConfiguration');
    const config = _.assign(mainConfiguration.toRawConfig(), {
      managers: [],
      monitors: [],
      osds: [],
    });
    if (get(nodes, 'length')) {
      const rawNodesConfig = nodes.invoke('toRawConfig');
      _.mergeWith(config, ...rawNodesConfig, (objValue, srcValue) => {
        if (_.isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      });
    }
    return config;
  },
});
