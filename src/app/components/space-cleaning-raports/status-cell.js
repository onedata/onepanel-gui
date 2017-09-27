import Ember from 'ember';

const {
  observer,
  computed,
  computed: {
    oneWay,
  },
  on,
} = Ember;

export default Ember.Component.extend({
  classNames: ['status-cell'],
  classNameBindings: ['_status'],

  /**
   * Record.
   * To inject.
   * @type {Object}
   */
  record: null,

  /**
   * Column.
   * To inject.
   * @type {Object}
   */
  column: null,

  /**
   * Status value.
   * @typ {computed.string}
   */
  _status: null,

  /**
   * Icon name.
   * @type {computed.string}
   */
  _iconName: computed('_status', function () {
    switch (this.get('_status')) {
      case 'success':
        return 'checkbox-filled';
      case 'failure':
        return 'checkbox-filled-x';
      default:
        return '';
    }
  }),

  columnObserver: on('init', observer('column.propertyName', function () {
    let propertyName = this.get('column.propertyName');
    this.set('_status', oneWay(`record.${propertyName}`));
  })),
});
