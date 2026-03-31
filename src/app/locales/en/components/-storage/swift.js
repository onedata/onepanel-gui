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
    label: 'Block size [bytes]',
    placeholder: 'Default: 10485760',
    tip: 'Storage block size in bytes i.e. the maximum object size. Files larger than one block will stripped and stored in a series of objects. Must be more than zero for non-imported storage. To enable import from an Swift storage, block size must be set to zero, together with "canonical" path type and the read-only mode.',
  },
};
