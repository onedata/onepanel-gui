export default {
  copiesNumber: {
    name: 'Number of copies',
    tip: 'Number of data copies to distribute among OSDs',
    lteMessage: 'This field must be less than or equal to the number of Ceph OSDs',
  },
  minCopiesNumber: {
    name: 'Min. number of copies',
    tip: 'Number of data copies below which (e.g. in case of OSD failure) new writes will not be permitted.',
    lteMessage: 'This field must be less than or equal to the number of copies',
  },
  blockSize: {
    name: 'Block size',
    tip: 'Storage block size in bytes. Default: 4194304 bytes (4 MiB).',
  },
  timeout: { name: 'Timeout [ms]' },
};