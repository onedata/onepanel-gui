import _ from 'lodash';
import ceph from './ceph';

const cephRadosSpecific = {
  blockSize: {
    name: 'Block size [bytes]',
    tip: 'Each file will be split across a number of Ceph RADOS objects of the specified size. For optimal performance, this value should be equal to the object size configured in a given Ceph Storage Cluster (default 4M).',
  },
};

export default _.assign({}, ceph, cephRadosSpecific);
