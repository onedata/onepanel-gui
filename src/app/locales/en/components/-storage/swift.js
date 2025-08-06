import common from './common';

export default {
  username: {
    label: 'Admin username',
    tip: 'The Keystone authentication username.',
  },
  password: {
    label: 'Admin password',
    tip: 'The Keystone authentication password.',
  },
  projectName: {
    label: 'Project name',
    tip: 'The Keystone project name.',
  },
  userDomainName: {
    label: 'User domain name',
    tip: 'The Keystone user domain name.',
    placeholder: 'Default: Default',
  },
  projectDomainName: {
    label: 'Project domain name',
    tip: 'The Keystone project domain name.',
    placeholder: 'Default: Default',
  },
  authUrl: {
    label: 'Auth URL',
    tip: 'The URL to OpenStack Identity Service (Keystone) V3.',
    placeholder: 'Example: https://example.com:5000/v3',
  },
  containerName: {
    label: 'Container name',
    tip: 'The name of the Swift storage container.',
  },
  blockSize: {
    label: 'Block size',
    placeholder: 'Default: 10485760',
  },
  timeout: common.timeout,
};
