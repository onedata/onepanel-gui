import { A } from '@ember/array';
import Service from '@ember/service';
import { Promise } from 'rsvp';
import { get } from '@ember/object';

import _ from 'lodash';

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Service.extend({
  __spaces: undefined,

  init() {
    this._super(...arguments);
    this.set('__spaces', []);
  },

  getSpaces() {
    return PromiseObject.create({
      promise: new Promise(resolve => {
        const spaceDetailsList = A();
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
