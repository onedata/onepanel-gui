export default {
  accessKey: { name: 'Admin access key' },
  secretKey: { name: 'Admin secret key' },
  hostname: { name: 'Hostname' },
  bucketName: { name: 'Bucket name' },
  blockSize: {
    name: 'Block size [bytes]',
    tip: 'Storage block size in bytes. In case the block size is "0" and "canonical" path type is selected, each file is stored in a single S3 object. This value must be set to "0" to enable data import from an existing S3 bucket.',
  },
  maximumCanonicalObjectSize: {
    name: 'Maximum canonical object size',
    tip: 'Defines the maximum size for objects, which can be modified on the S3 storage in "canonical" path mode. In this mode, entire file needs to be downloaded to memory, modified and uploaded back, which is impractical for large files (default 64 MiB).',
  },
  fileMode: {
    name: 'File mode',
    tip: 'Defines the file permissions, which files imported from S3 storage will have in Onedata. Values should be provided in octal format e.g. "0644".',
  },
  dirMode: {
    name: 'Directory mode',
    tip: 'Defines the directory mode which directories imported from S3 storage will have in Onedata. Values should be provided in octal format e.g. "0775".',
  },
  timeout: { name: 'Timeout [ms]' },
};
