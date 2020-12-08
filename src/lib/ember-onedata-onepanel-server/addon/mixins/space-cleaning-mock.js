/**
 * Adds a mocked "live" cleaning statistics (cleaning will start and will
 * consume space bytes). See `service:onepanel-server-mock` for example of usage.
 *
 * @module mixins/space-cleaning-mock
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';

class MockState {
  constructor(target, threshold, steps) {
    this.spaceOccupancy = threshold;
    this.target = target;
    this.step = Math.floor((threshold - target) / steps);
    this.lastRunStatus = null;
    this.startTimeout = setTimeout(() => {
      this._startLoop();
    }, 2000);
  }
  _startLoop() {
    this.lastRunStatus = 'active';
    this.interval = setInterval(this.tick.bind(this), 1000);
  }
  forceStart() {
    if (this.interval == null && this.lastRunStatus !== 'active') {
      // TODO: currently fake target, because we do not remember real target
      this.target = this.target - Math.pow(1024, 2);
      this._startLoop();
    }
  }
  tick() {
    if (this.lastRunStatus === 'active') {
      this.spaceOccupancy -= this.step;
      if (this.spaceOccupancy <= this.target) {
        this.spaceOccupancy = this.target;
        this.lastRunStatus = 'completed';
        this.stop();
      }
    }
  }
  stop() {
    clearInterval(this.interval);
    this.interval = null;
    this.lastRunStatus = 'cancelled';
  }
  getData() {
    return {
      lastRunStatus: this.lastRunStatus,
      spaceOccupancy: this.spaceOccupancy,
    };
  }
}

export default Mixin.create({
  cleanStatesCache: {},

  _getAutoCleaningStatus(id, target, threshold, steps) {
    return this._getAutoCleaningStatusMock(id, target, threshold, steps).getData();
  },

  _getAutoCleaningStatusMock(
    id,
    target = 100000000,
    threshold = 500000000,
    steps = 100
  ) {
    const cached = this.get(`cleanStatesCache.${id}`);
    if (cached) {
      return cached;
    } else {
      return this.set(
        `cleanStatesCache.${id}`,
        new MockState(target, threshold, steps)
      );
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
