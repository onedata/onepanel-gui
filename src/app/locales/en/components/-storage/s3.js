export default {
  hostname: {
    label: 'Endpoint URL',
    tip: 'The URL of the S3 service endpoint. It must include the scheme (http or https) and may optionally include a port (after a colon). If the hostname is s3.amazonaws.com, the "Region" field becomes mandatory; the region is then automatically prepended to the hostname (e.g. providing eu-west-3 for https://s3.amazonaws.com results in https://eu-west-3.s3.amazonaws.com).',
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
    tip: 'The S3 region, sent with each request to the S3 server. Required if the endpoint hostname is s3.amazonaws.com, in which case the region is also prepended to the hostname. For other S3 providers it is optional and defaults to us-east-1.',
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
};
