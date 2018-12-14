import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  oneproviderRoute: computed(function oneproviderRoute() {
    return ['onedata.sidebar.content', 'data', this.get('cluster.serviceId')];
  }),
});
