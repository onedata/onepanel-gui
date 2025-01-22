export default {
  archiveStorage: {
    name: 'Archive storage',
    tip: 'Defines whether storage supports long-term dataset archiving.',
  },
  accessKey: { name: 'Admin access key' },
  secretKey: { name: 'Admin secret key' },
  hostname: {
    name: 'Endpoint URL',
    tip: 'The URL of the S3 service endpoint, including the scheme (http or https) and optionally a port (after a colon).',
  },
  bucketName: { name: 'Bucket name' },
  verifyServerCertificate: {
    name: 'Verify server cert.',
    tip: 'Enables or disables verification of the S3 server SSL certificate.',
  },
  region: {
    name: 'Region',
    tip: 'Allows to specify a custom S3 region, which will be send with each request to the S3 server.',
  },
  blockSize: {
    name: 'Block size [bytes]',
    tip: 'Storage block size in bytes i.e. the maximum object size. Files larger than one block will stripped and stored in a series of objects. Must be more than zero for non-imported storage. To enable import from an S3 storage, block size must be set to zero, together with "canonical" path type and the read-only mode.',
  },
  maximumCanonicalObjectSize: {
    name: 'Maximum canonical object size',
    tip: 'Defines the maximum size for objects, which can be modified on the S3 storage in "canonical" path mode. In this mode, entire file needs to be downloaded to memory, modified and uploaded back, which is impractical for large files (default 64 MiB).',
  },
  fileMode: {
    name: 'Imported file mode',
    tip: 'Defines the file permissions, which files imported from S3 storage will have in Onedata. Values should be provided in octal format e.g. "0664".',
  },
  dirMode: {
    name: 'Imported directory mode',
    tip: 'Defines the directory mode which directories imported from S3 storage will have in Onedata. Values should be provided in octal format e.g. "0775".',
  },
  timeout: { name: 'Timeout [ms]' },
};
