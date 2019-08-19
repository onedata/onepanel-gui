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

export default EmberObject.extend({
  onepanelServer: service(),

  /**
   * Hostname of the ceph node
   * @type {string}
   * @virtual
   */
  host: undefined,

  /**
   * @type {Utils/Ceph/OsdIdGenerator}
   * @virtual
   */
  osdIdGenerator: undefined,

  /**
   * @type {Ember.ComputedProperty<PromiseArray<Utils/Ceph/NodeDevice>>}
   */
  devices: computed('host', function devices() {
    const {
      host,
      onepanelServer,
    } = this.getProperties('host', 'onepanelServer');

    if (host) {
      return PromiseArray.create({
        promise: onepanelServer
          .request('oneprovider', 'getBlockDevices', host)
          .then(({ data }) =>
            data['blockDevices']
            // mounted devices should not be used as OSD device for safety reasons
            // (to avoid unintentional data lost)
            .filter(device => !get(device, 'mounted'))
            .map(device => CephNodeDevice.create(device))
          ),
      });
    } else {
      return PromiseArray.create({
        // infinite loading
        promise: new Promise(() => {}),
      });
    }
  }),

  /**
   * Mapping: deviceId -> number of usages in unique osds
   * @type {object}
   */
  usedDevices: computed(
    'devices.{[],isFulfilled}',
    'osds.@each.{type,device,dbDevice}',
    function usedDevices() {
      const {
        osds,
        devices,
      } = this.getProperties('osds', 'devices');
      if (!get(devices, 'isFulfilled')) {
        return {};
      } else {
        // initial object: deviceId -> 0
        const used = {};
        devices
          .mapBy('id')
          .forEach(id => set(used, id, 0));

        osds
          .filter(osd => get(osd, 'type') === 'bluestore')
          .forEach(osd => {
            const osdDevicesPaths = _.uniq(_.values(
              getProperties(osd, 'device', 'dbDevice')
            )).compact();
            osdDevicesPaths
              // find device by path
              .map(path => devices.findBy('path', path))
              // remove not-found values (undefined)
              .compact()
              // map to device id
              .mapBy('id')
              // increment proper field in `used` object
              .forEach(id => set(used, id, get(used, id) + 1));
          });
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
  osds: computed(function osds() {
    return A();
  }),

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
    const {
      osdIdGenerator,
      osds,
    } = this.getProperties('osdIdGenerator', 'osds');

    const osd = CephOsdConfiguration.create({
      node: this,
      id: osdIdGenerator.getNextId(),
      type: 'filestore',
      device: get((this.getDeviceForNewOsd() || {}), 'path'),
    });

    osds.pushObject(osd);
    return osd;
  },

  /**
   * Removes OSD by id.
   * @param {number} id 
   */
  removeOsd(id) {
    const osds = this.get('osds');
    const osdToRemove = osds.findBy('id', id);
    if (osdToRemove) {
      set(osdToRemove, 'node', undefined);
      osds.removeObject(osdToRemove);
    }
  },

  /**
   * Returns device that can be proposed for new OSD. If all devices are already
   * used, undefined is returned.
   * @returns {Object|undefined}
   */
  getDeviceForNewOsd() {
    const {
      usedDevices,
      devices,
    } = this.getProperties('usedDevices', 'devices');
    if (!get(devices, 'isFulfilled')) {
      return undefined;
    } else {
      return devices.filter(dev => get(usedDevices, get(dev, 'id')) === 0)[0] ||
        devices.objectAt(0);
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
    let {
      managers,
      monitors,
      osds,
    } = getProperties(newConfig, 'managers', 'monitors', 'osds');
    [
      managers,
      monitors,
      osds,
    ] = [
      managers,
      monitors,
      osds,
    ].map(services => services.filterBy('host', host));

    set(managerMonitor, 'isEnabled', !!get(managers.concat(monitors), 'length'));
    const monitorIp = get(monitors[0] || {}, 'ip');
    managerMonitor.fillIn({
      monitorIp,
    });

    nodeOsds.clear();
    osds.forEach(osdConfig => {
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
