import EmberObject, { computed, get, getProperties } from '@ember/object';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import cephOsdIdGenerator from 'onepanel-gui/utils/ceph/osd-id-generator';
import _ from 'lodash';
import CephNodeConfiguration from 'onepanel-gui/utils/ceph/node-configuration';
import CephClusterMainConfiguration from 'onepanel-gui/utils/ceph/cluster-main-configuration';

export default EmberObject.extend({
  /**
   * @type {Utils/Ceph/ClusterMainConfiguration}
   */
  mainConfiguration: computed(function mainConfiguration() {
    return CephClusterMainConfiguration.create();
  }),

  osdIdGenerator: undefined,

  nodes: computed(function nodes() {
    return A();
  }),

  hasOsd: computed('nodes.@each.hasOsd', function hasOsd() {
    return this.get('nodes').isAny('hasOsd');
  }),

  hasManagerMonitor: computed(
    'nodes.@each.hasManagerMonitor',
    function hasManagerMonitor() {
      return this.get('nodes').isAny('hasManagerMonitor');
    }
  ),

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
      } = this.getProperties('nodes', 'hasOsd', 'hasManagerMonitor', 'mainConfiguration');
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

  removeNodeByHost(host) {
    const nodes = this.get('nodes');
    const node = nodes.findBy('host', host);
    if (node) {
      nodes.removeObject(node);
    }
    return !!node;
  },

  fillIn(newConfig) {
    const {
      managers,
      monitors,
      osds,
    } = getProperties(newConfig, 'managers', 'monitors', 'osds');
    this.get('mainConfiguration').fillIn(newConfig);
    const hosts = _.concat(managers, monitors, osds).mapBy('host').uniq();
    hosts.forEach(host => {
      const node = this.addNode(host);
      node.fillIn(newConfig);
    });
  },

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
