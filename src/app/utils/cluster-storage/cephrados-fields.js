import cephFields from './ceph-fields';
import _ from 'lodash';

const separatorKey = 'poolName';
const cephTop = [];
const cephBottom = [];

let areTopKeys = true;
cephFields.forEach(field => {
  (areTopKeys ? cephTop : cephBottom).push(field);
  if (field.name === separatorKey) {
    areTopKeys = false;
  }
});

const cephRadosSpecific = [{
  name: 'blockSize',
  type: 'number',
  defaultValue: 4194304,
  example: '4194304',
}];

export default _.concat(cephTop, cephRadosSpecific, cephBottom);
