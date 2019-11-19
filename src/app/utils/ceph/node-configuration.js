/**
 * Class that represents Ceph node parameters.
 * 
 * @module utils/ceph/node-configuration
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, set, get, getProperties } from '@ember/object';
import { gt, reads } from '@ember/object/computed';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import _ from 'lodash';
import CephManagerMonitorConfiguration from 'onepanel-gui/utils/ceph/manager-monitor-configuration';
import CephOsdConfiguration from 'onepanel-gui/utils/ceph/osd-configuration';
import CephNodeDevice from 'onepanel-gui/utils/ceph/node-device';
import { v4 as uuid } from 'ember-uuid';
import { isPresent } from '@ember/utils';
import { reject } from 'rsvp';
import { array, raw } from 'ember-awesome-macros';

export default EmberObject.extend({
  onepanelServer: service(),

  /**
   * Hostname of the ceph node
   * @type {string}
   * @virtual
   */
  host: undefined,

  /**
   * @type {Ember.ComputedProperty<PromiseArray<Utils/Ceph/NodeDevice>>}
   */
  devicesProxy: computed('host', function devicesProxy() {
    const {
      host,
      onepanelServer,
    } = this.getProperties('host', 'onepanelServer');

    if (host) {
      return PromiseArray.create({
        promise: onepanelServer
          .request('oneprovider', 'getBlockDevices', host)
          .then(({ data }) =>
            data.blockDevices.map(device => CephNodeDevice.create(device))
          ),
      });
    } else {
      return PromiseArray.create({
        promise: reject(),
      });
    }
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Utils/Ceph/NodeDevice>>}
   */
  notMountedDevices: array.rejectBy('devicesProxy', raw('mounted')),

  /**
   * Mapping: deviceId -> number of usages in unique osds
   * @type {object}
   */
  usedDevices: computed(
    'devicesProxy.{[],isFulfilled}',
    'osds.@each.{type,device}',
    function usedDevices() {
      const {
        osds,
        devicesProxy,
      } = this.getProperties('osds', 'devicesProxy');
      if (!get(devicesProxy, 'isFulfilled')) {
        return {};
      } else {
        // initial object: deviceId -> 0
        const used = {};
        devicesProxy
          .mapBy('id')
          .forEach(id => set(used, id, 0));

        osds
          .filterBy('type', 'blockdevice')
          .mapBy('device')
          .compact()
          // find device by path
          .map(path => devicesProxy.findBy('path', path))
          // remove not-found values (undefined)
          .compact()
          // map to device id
          .mapBy('id')
          // increment proper field in `used` object
          .forEach(id => set(used, id, get(used, id) + 1));
        
        return used;
      }
    }
  ),

  /**
   * If true then the whole node has a valid configuration
   * @type {boolean}
   */
  isValid: computed(
    'managerMonitor.{isEnabled,isValid}',
    'osds.@each.{isValid}',
    'usedDevices',
    function isValid() {
      const {
        managerMonitor,
        osds,
        usedDevices,
      } = this.getProperties('managerMonitor', 'osds', 'usedDevices');
      const managerMonitorValid =
        get(managerMonitor, 'isEnabled') ? get(managerMonitor, 'isValid') : true;
      const osdsValid = osds.isEvery('isValid');
      const usedDevicesValid =
        get(_.values(usedDevices).filter(x => x > 1), 'length') === 0;
      return managerMonitorValid && osdsValid && usedDevicesValid;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Utils/Ceph/ManagerMonitorConfiguration>}
   */
  managerMonitor: computed(function managerMonitor() {
    return CephManagerMonitorConfiguration.create({
      node: this,
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Ember.A<Utils/Ceph/OsdConfiguration>>}
   */
  osds: computed(() => A()),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasOsd: gt('osds.length', 0),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasManagerMonitor: reads('managerMonitor.isEnabled'),

  /**
   * Creates new OSD and adds it to this node.
   * @returns {Utils/Ceph/OsdConfiguration}
   */
  addOsd() {
    const osds = this.get('osds');

    const osdUuid = uuid();
    const osd = CephOsdConfiguration.create({
      node: this,
      uuid: osdUuid,
      type: 'loopdevice',
      device: get((this.getDeviceForNewOsd() || {}), 'path'),
      path: `/volumes/persistence/ceph-loopdevices/osd-${osdUuid}.loop`,
      // size is not set, so osd configuration is invalid
      isValid: false,
    });

    osds.pushObject(osd);
    return osd;
  },

  /**
   * Removes OSD by uuid.
   * @param {string} uuid 
   */
  removeOsd(uuid) {
    const osds = this.get('osds');
    const osdToRemove = osds.findBy('uuid', uuid);
    if (osdToRemove) {
      set(osdToRemove, 'node', undefined);
      osds.removeObject(osdToRemove);
    }
  },

  /**
   * Returns device that can be proposed for new OSD. If all devices are already
   * used, first device is returned.
   * @returns {Object|undefined}
   */
  getDeviceForNewOsd() {
    const {
      usedDevices,
      notMountedDevices,
    } = this.getProperties('usedDevices', 'notMountedDevices');
    if (!isPresent(notMountedDevices)) {
      return undefined;
    } else {
      return notMountedDevices
        .filter(dev => get(usedDevices, get(dev, 'id')) === 0)[0] ||
        notMountedDevices.objectAt(0);
    }
  },

  /**
   * Fills in configuration with given data.
   * @param {Object} newConfig
   * @returns {undefined}
   */
  fillIn(newConfig) {
    const {
      managerMonitor,
      host,
      osds: nodeOsds,
    } = this.getProperties('managerMonitor', 'host', 'osds');
    const {
      managers,
      monitors,
      osds,
    } = getProperties(newConfig, 'managers', 'monitors', 'osds');
    const [
      newNodeManagers,
      newNodeMonitors,
      newNodeOsds,
    ] = [
      managers,
      monitors,
      osds,
    ].map(services => (services || []).filterBy('host', host));

    set(managerMonitor, 'isEnabled', isPresent(newNodeManagers.concat(newNodeMonitors)));
    const monitorIp = get(newNodeMonitors[0] || {}, 'ip');
    managerMonitor.fillIn({
      monitorIp,
    });

    nodeOsds.clear();
    newNodeOsds.forEach(osdConfig => {
      const osd = CephOsdConfiguration.create({
        node: this,
      });
      osd.fillIn(osdConfig);
      nodeOsds.pushObject(osd);
    });
  },

  /**
   * Creates raw object with configuration data. It is compatible with format
   * used by backend.
   * @returns {Object}
   */
  toRawConfig() {
    const {
      managerMonitor,
      osds,
    } = this.getProperties('managerMonitor', 'osds');

    const config = {
      osds: osds.invoke('toRawConfig'),
    };
    _.assign(config, managerMonitor.toRawConfig());
    return config;
  },
});