import _ from 'lodash';
import ceph from './ceph';

const cephRadosSpecific = {
  blockSize: {
    name: 'Block size [bytes]',
    tip: 'The data of every file will be striped across a number of underlying objects of the specified size. It also serves as the chunk size for read and write operations, impacting performance.',
  },
};

export default _.assign({}, ceph, cephRadosSpecific);
