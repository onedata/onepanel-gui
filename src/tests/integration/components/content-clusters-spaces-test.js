import Ember from 'ember';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import waitFor from 'onedata-gui-common/utils/wait-for';

import spaceManagerStub from '../../helpers/space-manager-stub';
import storageManagerStub from '../../helpers/storage-manager-stub';

const {
  Service,
} = Ember;

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

const i18nStub = Service.extend({
  t() {
    return 'translation-mock';
  }
});

describe('Integration | Component | content clusters spaces', function () {
  setupComponentTest('content-clusters-spaces', {
    integration: true,
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

    let spaceManager = this.container.lookup('service:space-manager');
    spaceManager.set('__spaces', SPACES);
  });

  it('shows support space form when clicking on support space button', function (done) {
    this.render(hbs`
      <button class="collapsible-toolbar-global-toggle"></button>
      {{content-clusters-spaces}}
    `);
    this.$('button.btn-support-space').click();

    let supportFormAppeared = () => {
      return this.$('.support-space-form').length === 1;
    };

    waitFor(supportFormAppeared, {
      resolve: done,
      reject: () => expect(false, 'support form to appear').to.be.ok
    });
  });
});
