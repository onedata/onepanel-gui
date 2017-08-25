import Ember from 'ember';

const {
  A,
  Service,
  RSVP: { Promise },
} = Ember;

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Service.extend({
  __spaces: [],

  getSpaces() {
    return PromiseObject.create({
      promise: new Promise(resolve => {
        let spaceDetailsList = A();
        for (let space in this.get('__spaces')) {
          spaceDetailsList.push(this.getSpaceDetails(space.id));
        }
        resolve(spaceDetailsList);
      }),
    });
  },
  getSpaceDetails(id) {
    return PromiseObject.create({
      promise: new Promise((resolve) => resolve(this.get('__spaces')[id])),
    });
  },
});
