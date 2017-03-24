import SpinButton from 'ember-spin-button/components/spin-button';
import Ember from 'ember';

const {
  computed: { alias },
} = Ember;

export default SpinButton.extend({
  defaultTimeout: alias('defaultTimout'),

  defaultTimout: false,
  startDelay: 0,
  buttonStyle: 'expand-left',
});
