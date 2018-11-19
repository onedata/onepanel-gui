import EmberObject from '@ember/object';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default EmberObject.extend({
  //TODO inject service to load nextId

  nextId: 0,

  loadingProxy: undefined,

  init() {
    this._super(...arguments);

    // TODO change 0 to id
    this.set('loadingPromise', PromiseObject.create({
      promise: Promise.resolve().then(id => safeExec(this, 'set', 'nextId', 0)),
    }));
  },

  getNextId() {
    const nextId = this.get('nextId');
    this.set('nextId', nextId + 1);
    return nextId;
  },
});
