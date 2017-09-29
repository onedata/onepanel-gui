import Ember from 'ember';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

import spaceManagerStub from '../../helpers/space-manager-stub';
import storageManagerStub from '../../helpers/storage-manager-stub';
import providerManagerStub from '../../helpers/provider-manager-stub';
import { registerService, lookupService } from '../../helpers/stub-service';

const {
  Service,
} = Ember;

const SPACES = [{
    id: 'a1',
    name: 'Space A1',
    supportingProviders: [],
  },
  {
    id: 'b2',
    name: 'Space Conflicting',
    supportingProviders: [],
  },
  {
    id: 'c3',
    name: 'Space Conflicting',
    supportingProviders: [],
  },
];

const i18nStub = Service.extend({
  t() {
    return 'translation-mock';
  },
});

describe('Integration | Component | content clusters spaces', function () {
  setupComponentTest('content-clusters-spaces', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'space-manager', spaceManagerStub);
    registerService(this, 'i18n', i18nStub);
    registerService(this, 'storage-manager', storageManagerStub);
    registerService(this, 'provider-manager', providerManagerStub);

    const spaceManager = lookupService(this, 'space-manager');
    spaceManager.set('__spaces', SPACES);
  });

  it('shows support space form when clicking on support space button', function (done) {
    this.render(hbs `
      <button class="collapsible-toolbar-global-toggle"></button>
      {{content-clusters-spaces}}
    `);

    this.$('button.btn-support-space').click();

    wait().then(() => {
      expect(this.$('.support-space-form')).to.exist;
      done();
    });
  });
});
