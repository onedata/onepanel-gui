import common from './common';

export default {
  volume: { label: 'Volume name' },
  hostname: { label: 'Volume server host' },
  port: {
    label: 'Volume server port',
    placeholder: 'Default: 24007',
  },
  transport: {
    label: 'Volume transport',
    options: {
      tcp: {
        label: 'TCP',
      },
      rdma: {
        label: 'RDMA',
      },
      socket: {
        label: 'socket',
      },
    },
  },
  mountPoint: { label: 'Relative mountpoint in volume' },
  xlatorOptions: { label: 'Custom client translator options' },
  timeout: common.timeout,
};
