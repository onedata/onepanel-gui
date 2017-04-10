import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

import Ember from 'ember';

describe('Integration | Component | cluster spaces table', function () {
  setupComponentTest('cluster-spaces-table', {
    integration: true
  });

  it('renders error message when at least one space details fetch was rejected',
    function () {
      let spaces = [
        Ember.Object.create({
          isSettled: true,
          isRejected: false,
          isFulfilled: true,
          content: {
            id: 'space-1',
            name: 'Space 1',
          }
        }),
        Ember.Object.create({
          isSettled: true,
          isRejected: true,
          isFulfilled: false,
          reason: 'reason-one',
        }),
        Ember.Object.create({
          isSettled: true,
          isRejected: true,
          isFulfilled: false,
          reason: 'reason-two',
        }),
      ];

      this.set('spaces', spaces);

      this.render(hbs `{{cluster-spaces-table spaces=spaces}}`);
      expect(this.$(
        '.alert-some-spaces-rejected')).to.have.length(1);
    });

  it('does not render error message when at all spaces are fetched successfully',
    function () {
      let spaces = [
        Ember.Object.create({
          isSettled: true,
          isRejected: false,
          isFulfilled: true,
          content: {
            id: 'space-1',
            name: 'Space 1',
          }
        }),
        Ember.Object.create({
          isSettled: true,
          isRejected: false,
          isFulfilled: true,
          content: {
            id: 'space-2',
            name: 'Space 2',
          }
        }),
      ];

      this.set('spaces', spaces);

      this.render(hbs `{{cluster-spaces-table spaces=spaces}}`);
      expect(this.$('.alert-some-spaces-rejected')).to.have.length(0);
    });
});
