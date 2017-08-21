import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import i18n from 'ember-i18n/services/i18n';

describe('Integration | Component | space status icons', function () {
  setupComponentTest('space-status-icons', {
    integration: true,
  });

  beforeEach(function () {
    this.register('service:i18n', i18n);
    this.inject.service('i18n', { as: 'i18n' });
  });

  it('shows only import icon when import is enabled and update is disabled', function () {
    this.set('space', Ember.Object.create({
      importEnabled: true,
      updateEnabled: false,
    }));
    this.set('syncStats', {
      importStatus: 'done',
    });

    this.render(hbs `
    {{space-status-icons space=space syncStats=syncStats}}
    `);

    expect(this.$('.oneicon-space-import')).to.be.visible;
    expect(this.$('.oneicon-update')).to.be.hidden;
  });

  it('shows import and update icons when enabled', function () {
    this.set('space', Ember.Object.create({
      importEnabled: true,
      updateEnabled: true,
    }));
    this.set('syncStats', {
      importStatus: 'done',
      updateStatus: 'done',
    });

    this.render(hbs `
    {{space-status-icons space=space syncStats=syncStats}}
    `);

    expect(this.$('.oneicon-space-import')).to.be.visible;
    expect(this.$('.oneicon-update')).to.be.visible;
  });

  it('does not render status toolbar if import and update are disabled', function () {
    this.set('space', Ember.Object.create({
      importEnabled: false,
      updateEnabled: false,
    }));

    this.render(hbs `
    {{space-status-icons space=space syncStats=syncStats}}
    `);
    expect(this.$('.space-status-icons')).to.be.hidden;
  });
});
