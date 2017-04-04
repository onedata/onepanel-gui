import Ember from 'ember';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import waitFor from 'onepanel-gui/utils/wait-for';

const {
  A,
  Service,
  ObjectProxy,
  PromiseProxyMixin,
  RSVP: { Promise },
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

const SPACES = {
  a1: {
    id: 'a1',
    name: 'Space A1',
    supportingProviders: [],
  },
  b2: {
    id: 'b2',
    name: 'Space B2',
    supportingProviders: [],
  },
  c3: {
    id: 'c3',
    name: 'Space C3',
    supportingProviders: [],
  }
};

const spaceManagerStub = Service.extend({
  getSpaces() {
    return ObjectPromiseProxy.create({
      promise: new Promise((resolve) => resolve(A([
        this.getSpaceDetails('a1'),
        this.getSpaceDetails('b2'),
        this.getSpaceDetails('c3'),
      ])))
    });
  },
  getSpaceDetails(id) {
    return ObjectPromiseProxy.create({
      promise: new Promise((resolve) => resolve(SPACES[id]))
    });
  },
});

const storageManagerStub = Service.extend({
  getStorages() {
    return ObjectPromiseProxy.create({
      promise: new Promise((resolve) => resolve(A([])))
    });
  }
});

const i18nStub = Service.extend({
  t() {
    return 'translation-mock';
  }
});

describe('Integration | Component | content clusters spaces', function () {
  setupComponentTest('content-clusters-spaces', {
    integration: true,
    // setup() {
    //   i18nInitializer.initialize(this);
    // },
  });

  beforeEach(function () {
    this.register('service:space-manager', spaceManagerStub);
    this.register('service:i18n', i18nStub);
    this.register('service:storage-manager', storageManagerStub);
    // Calling inject puts the service instance in the test's context,
    // making it accessible as "locationService" within each test
    this.inject.service('space-manager', { as: 'spaceManager' });
    this.inject.service('i18n', { as: 'i18n' });
    this.inject.service('storage-manager', { as: 'storageManager' });
  });

  // it('renders list of space names', function () {
  //   this.render(hbs `{{content-clusters-spaces}}`);
  //   let $component = this.$('.content-clusters-spaces');
  //   let htmlCode = $component.html();

  //   for (let spaceId in SPACES) {
  //     let space = SPACES[spaceId];
  //     expect(htmlCode).matches(new RegExp(`.*${space.name}.*`));
  //   }
  // });

  it('shows support space form when clicking on support space button', function (done) {
    this.render(hbs `{{content-clusters-spaces}}`);
    this.$('.btn-support-space').click();

    let supportFormAppeared = () => {
      return this.$('.support-space-form').length === 1;
    };

    waitFor(supportFormAppeared, {
      resolve: done,
      reject: () => expect(false, 'support form to appear').to.be.ok
    });
  });
});
