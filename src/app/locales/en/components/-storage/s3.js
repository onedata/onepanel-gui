import common from './common';

export default {
  hostname: {
    label: 'Endpoint URL',
    tip: 'The URL of the S3 service endpoint, including the scheme (http or https) and optionally a port (after a colon).',
    placeholder: 'Example: https://s3.example.com',
    regexMessage: 'This field should be a URL with http or https scheme',
  },
  bucketName: { label: 'Bucket name' },
  verifyServerCertificate: {
    label: 'Verify server cert.',
    tip: 'Enables or disables verification of the S3 server SSL certificate.',
  },
  region: {
    label: 'Region',
    tip: 'Allows to specify a custom S3 region, which will be send with each request to the S3 server.',
    placeholder: 'Default: us-east-1',
  },
  accessKey: { label: 'Admin access key' },
  secretKey: { label: 'Admin secret key' },
  blockSize: {
    label: 'Block size [bytes]',
    tip: 'Storage block size in bytes i.e. the maximum object size. Files larger than one block will stripped and stored in a series of objects. Must be more than zero for non-imported storage. To enable import from an S3 storage, block size must be set to zero, together with "canonical" path type and the read-only mode.',
    placeholder: 'Default: 10485760',
  },
  fileMode: {
    label: 'Imported file mode',
    tip: 'Defines the file permissions, which files imported from S3 storage will have in Onedata. Values should be provided in octal format e.g. "0664".',
    placeholder: 'Default: 0664',
    regexMessage: 'This field should be octal POSIX permissions',
  },
  dirMode: {
    label: 'Imported directory mode',
    tip: 'Defines the directory mode which directories imported from S3 storage will have in Onedata. Values should be provided in octal format e.g. "0775".',
    placeholder: 'Default: 0775',
    regexMessage: 'This field should be octal POSIX permissions',
  },
  timeout: common.timeout,
};
