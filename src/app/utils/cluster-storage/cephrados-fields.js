import cephFields from './ceph-fields';
import _ from 'lodash';

const separatorKey = 'poolName';
const separatorIndexNext = _.findIndex(cephFields, { name: separatorKey }) + 1;
const cephTop = cephFields.slice(0, separatorIndexNext);
const cephBottom = cephFields.slice(separatorIndexNext, cephFields.length);

const cephRadosSpecific = [{
  name: 'blockSize',
  type: 'number',
  defaultValue: 4194304,
  example: '4194304',
  gt: 0,
}];

export default _.concat(cephTop, cephRadosSpecific, cephBottom);
