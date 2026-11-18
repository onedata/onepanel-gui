export default {
  hostname: {
    label: 'Endpoint URL',
    tip: 'URL of the S3 endpoint. It must include the scheme (http or https) and may include a port after a colon. For the global AWS endpoint (s3.amazonaws.com), the `region` field is required, and requests go to that region\'s endpoint (e.g. for `eu-west-3`, `https://s3.eu-west-3.amazonaws.com`).',
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
    tip: 'Region of the bucket. Required for the global AWS endpoint (s3.amazonaws.com), so that requests go straight to the right region without an extra lookup. Optional for other endpoints; defaults to us-east-1. A region in the hostname (e.g. s3.eu-west-3.amazonaws.com) takes precedence over this field.',
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
