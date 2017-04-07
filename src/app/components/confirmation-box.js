// import BsPopover from 'ember-bootstrap/components/bs-popover';
import Ember from 'ember';
const {
  Component,
} = Ember;

export default Component.extend({
  classNames: ['confirmation-box'],

  title: null,
  autoPlacement: true,
  renderInPlace: false,

  cancelLabel: 'No',
  confirmLabel: 'Yes',
});
