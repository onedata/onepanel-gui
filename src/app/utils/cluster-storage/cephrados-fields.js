import cephFields from './ceph-fields';
import _ from 'lodash';

const separatorKey = 'poolName';
const separatorIndexNext = _.findIndex(cephFields, { name: separatorKey }) + 1;
const cephTop = cephFields.slice(0, separatorIndexNext);
const cephBottom = cephFields.slice(separatorIndexNext, cephFields.length);

const cephRadosSpecific = [{
  name: 'blockSize',
  type: 'number',
  gt: 0,
  notEditable: true,
  defaultPlaceholder: 4194304,
  isDefault: true,
  tip: true,
  optional: true,
}];

export default _.concat(cephTop, cephRadosSpecific, cephBottom);
