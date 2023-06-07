import Service from '@ember/service';
import { Promise } from 'rsvp';
import { get } from '@ember/object';
import BatchResolver from 'onedata-gui-common/utils/batch-resolver';

import _ from 'lodash';

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Service.extend({
  __spaces: undefined,

  init() {
    this._super(...arguments);
    this.set('__spaces', []);
  },

  async getSpacesBatchResolver() {
    const fetchFunctions = this.__spaces.map(space => {
      return () => {
        return this.getSpaceDetails(space.id);
      };
    });
    return BatchResolver.create({
      promiseFunctions: fetchFunctions,
      chunkSize: 20,
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
