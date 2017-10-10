/**
 * Adds a mocked "live" cleaning statistics (cleaning will start and will
 * consume space bytes). See `service:onepanel-server-mock` for example of usage.
 *
 * @module mixins/space-cleaning-stats-mock
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  Mixin,
} = Ember;

class MockState {
  constructor(target, threshold, steps) {
    this.spaceUsed = threshold;
    this.target = target;
    this.step = Math.floor((threshold - target) / steps);
    this.isWorking = false;
    setTimeout(() => {
      this.isWorking = true;
      this.interval = setInterval(this.tick.bind(this), 1000);
    }, 2000);
  }
  tick() {
    if (this.isWorking) {
      this.spaceUsed -= this.step;
      if (this.spaceUsed <= this.target) {
        this.spaceUsed = this.target;
        this.isWorking = false;
        this.stop();
      }
    }
  }
  stop() {
    clearInterval(this.interval);
  }
  getData() {
    return {
      isWorking: this.isWorking,
      spaceUsed: this.spaceUsed,
    };
  }
}

export default Mixin.create({
  cleanStatesCache: {},

  _getAutoCleaningStatus(id, target = 100000000, threshold = 500000000, steps = 100) {
    const cached = this.get(`cleanStatesCache.${id}`);
    if (cached) {
      return cached.getData();
    } else {
      return this.set(
        `cleanStatesCache.${id}`,
        new MockState(target, threshold, steps)
      ).getData();
    }
  },

  willDestroy() {
    try {
      const cleanStatesCache = this.get('cleanStatesCache');
      for (let sid in cleanStatesCache) {
        cleanStatesCache[sid].stop();
      }
    } finally {
      this._super(...arguments);
    }
  },

});
