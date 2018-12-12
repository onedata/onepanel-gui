import EmberObject, { computed, observer, set, get, getProperties } from '@ember/object';
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

  devices: computed(function devices() {
    return PromiseArray.create({
      // infinite loading
      promise: new Promise(() => {}),
    });
  }),

  osdIdGenerator: undefined,

  /**
   * Mapping: deviceId -> number of usages in unique osds
   * @type {object}
   */
  usedDevices: computed(
    'devices.[]',
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
            const osdDevicesNames = _.uniq(_.values(
              getProperties(osd, 'device', 'dbDevice')
            )).compact();
            osdDevicesNames
              // find device by name
              .map(name => devices.findBy('name', name))
              // return not-found values (undefined)
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
        get(managerMonitor, 'isEnabled') && get(managerMonitor, 'isValid');
      const osdsValid = osds.isEvery('isValid');
      const usedDevicesValid = 
        get(_.values(usedDevices).filter(x => x > 1), 'length') === 0;
      return managerMonitorValid && osdsValid && usedDevicesValid;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Utils/CephManagerMonitorConfig>}
   */
  managerMonitor: computed(function managerMonitor() {
    return CephManagerMonitorConfiguration.create({
      node: this,
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Ember.A<Utils/CephOsdrConfig>>}
   */
  osds: computed(function osds() {
    return A();
  }),

  hasOsd: gt('osds.length', 0),

  hasManagerMonitor: reads('managerMonitor.isEnabled'),
  
  hostObserver: observer('host', function hostObserver() {
    const {
      host,
      onepanelServer,
    } = this.getProperties('host', 'onepanelServer');
    let promiseArray;

    if (host) {
      promiseArray = PromiseArray.create({
        promise: onepanelServer
          .request('oneprovider', 'getBlockDevices', host)
          .then(response =>
            response.data['block_devices']
              .filter(device => !get(device, 'mounted'))
              .map(device => CephNodeDevice.create(device))
          ),
      });
    } else {
      promiseArray = PromiseArray.create({
        // infinite loading
        promise: new Promise(() => {}),
      });
    }
    this.set('devices', promiseArray);
  }),

  init() {
    this._super(...arguments);
    this.hostObserver();
  },

  addOsd() {
    const {
      osdIdGenerator,
      osds,
    } = this.getProperties('osdIdGenerator', 'osds');

    const osd = CephOsdConfiguration.create({
      node: this,
      id: osdIdGenerator.getNextId(),
      type: 'bluestore',
      device: get((this.getDeviceForNewOsd() || {}), 'name'),
    });

    osds.pushObject(osd);
    return osd;
  },

  removeOsd(id) {
    const osds = this.get('osds');
    const osdToRemove = osds.findBy('id', id);
    if (osdToRemove) {
      set(osdToRemove, 'node', undefined);
      osds.removeObject(osdToRemove);
    }
  },

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

  fillIn(newConfig) {
    const {
      managerMonitor,
      host,
    } = this.getProperties('managerMonitor', 'host');
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

    osds.forEach(osdConfig => {
      const osd = CephOsdConfiguration.create({
        node: this,
      });
      osd.fillIn(osdConfig);
      this.get('osds').pushObject(osd);
    });
  },

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
