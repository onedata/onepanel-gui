const deploy = 'cluster installation';
const webCert = 'certificate setup';
const dns = 'DNS setup';
const ips = 'cluster IP adresses';
const done = 'summary';

export default {
  steps: {
    oneprovider: {
      deploy,
      oneproviderCeph: 'ceph configuration',
      ips,
      oneproviderRegistration: 'Oneprovider registration',
      webCert,
      dns,
      oneproviderStorageAdd: 'storage backend configuration',
      done,
    },
    onezone: {
      deploy,
      webCert,
      dns,
      ips,
      done,
    },
  },
};
