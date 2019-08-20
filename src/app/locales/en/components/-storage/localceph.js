export default {
  copiesNumber: {
    name: 'Number of copies',
    lteMessage: 'This field must be less than or equal to the number of Ceph OSDs',
  },
  minCopiesNumber: {
    name: 'Min. number of copies',
    lteMessage: 'This field must be less than or equal to the number of copies',
  },
  timeout: { name: 'Timeout [ms]' },
  insecure: { name: 'Insecure' },
  readonly: { name: 'Read only' },
};
