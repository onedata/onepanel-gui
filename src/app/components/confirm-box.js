import BsPopover from 'ember-bootstrap/components/bs-popover';

export default BsPopover.extend({
  classNames: ['confirmation-box', 'popover-confirmation'],

  title: null,
  autoPlacement: true,
  renderInPlace: true,

  cancelLabel: 'No',
  confirmLabel: 'Yes',
});
