import Ember from 'ember';

import _ from 'lodash';

const {
  A,
  Service,
  RSVP: { Promise },
  get,
} = Ember;

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Service.extend({
  __spaces: [],

  getSpaces() {
    return PromiseObject.create({
      promise: new Promise(resolve => {
        let spaceDetailsList = A();
        this.get('__spaces').forEach(space => {
          spaceDetailsList.push(this.getSpaceDetails(space.id));
        });
        resolve(spaceDetailsList);
      }),
    });
  },

  getSpaceDetails(id) {
    return PromiseObject.create({
      promise: new Promise((resolve) =>
        resolve(_.find(this.get('__spaces'), s => get(s, 'id') === id))
      ),
    });
  },

  getAutoCleaningStatus() {
    throw new Error('not implemented');
  },

  getAutoCleaningReports() {
    throw new Error('not implemented');
  },
});
