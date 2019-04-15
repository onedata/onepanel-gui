const installation = 'cluster installation';
const webCert = 'certificate setup';
const dns = 'DNS setup';
const ips = 'cluster IP adresses';
const summary = 'summary';

export default {
  steps: {
    oneprovider: {
      installation,
      ceph: 'ceph configuration',
      ips,
      providerRegistration: 'provider registration',
      webCert,
      dns,
      providerStorage: 'storage configuration',
      summary,
    },
    onezone: {
      installation,
      webCert,
      dns,
      ips,
      summary,
    },
  },
};
