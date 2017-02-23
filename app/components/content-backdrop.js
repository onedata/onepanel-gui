import Ember from 'ember';

import ContentBackdrop from 'ember-side-menu/components/content-backdrop';

const {
  computed: {
    oneWay
  }
} = Ember;

export default ContentBackdrop.extend({
  progress: oneWay("sideMenu.progress")
});
