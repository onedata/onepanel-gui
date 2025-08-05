import common from './common';

export default {
  archiveStorage: {
    label: 'Archive storage',
    tip: 'Defines whether storage supports long-term dataset archiving.',
  },
  accessKey: { label: 'Admin access key' },
  secretKey: { label: 'Admin secret key' },
  hostname: {
    label: 'Endpoint URL',
    tip: 'The URL of the S3 service endpoint, including the scheme (http or https) and optionally a port (after a colon).',
    placeholder: 'Example: https://s3.example.com',
  },
  bucketName: { label: 'Bucket name' },
  verifyServerCert: {
    label: 'Verify server cert.',
    tip: 'Enables or disables verification of the S3 server SSL certificate.',
  },
  region: {
    label: 'Region',
    tip: 'Allows to specify a custom S3 region, which will be send with each request to the S3 server.',
    placeholder: 'Default: us-east-1',
  },
  blockSize: {
    label: 'Block size [bytes]',
    tip: 'Storage block size in bytes i.e. the maximum object size. Files larger than one block will stripped and stored in a series of objects. Must be more than zero for non-imported storage. To enable import from an S3 storage, block size must be set to zero, together with "canonical" path type and the read-only mode.',
    placeholder: 'Default: 10485760',
  },
  maximumCanonicalObjectSize: {
    label: 'Maximum canonical object size',
    tip: 'Defines the maximum size for objects, which can be modified on the S3 storage in "canonical" path mode. In this mode, entire file needs to be downloaded to memory, modified and uploaded back, which is impractical for large files (default 64 MiB).',
    placeholder: 'Default: 67108864',
  },
  fileMode: {
    label: 'Imported file mode',
    tip: 'Defines the file permissions, which files imported from S3 storage will have in Onedata. Values should be provided in octal format e.g. "0664".',
    placeholder: 'Default: 0664',
  },
  dirMode: {
    label: 'Imported directory mode',
    tip: 'Defines the directory mode which directories imported from S3 storage will have in Onedata. Values should be provided in octal format e.g. "0775".',
    placeholder: 'Default: 0775',
  },
  timeout: common.timeout,
};
