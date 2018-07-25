import _ from 'lodash';
import ceph from './ceph';

const cephRadosSpecific = {
  blockSize: {
    name: 'Block size [bytes]',
    tip: 'Storage block size in bytes. Default: 4194304 bytes (4 MiB).',
  },
};

export default _.assign({}, ceph, cephRadosSpecific);
