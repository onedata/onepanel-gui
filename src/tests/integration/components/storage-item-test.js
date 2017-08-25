import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | storage item', function () {
  setupComponentTest('storage-item', {
    integration: true,
  });

  it('renders storage name', function (done) {
    let name = 'Storage One';
    this.set('storages', [{
      id: 'storage1',
      name,
      type: 'posix',
    }]);

    this.render(hbs `
    {{#one-collapsible-list as |list|}}
      {{#each storages as |storage|}}
        {{#list.item as |listItem|}}
          {{storage-item listItem=listItem storage=storage}}
        {{/list.item}}
      {{/each}}
    {{/one-collapsible-list}}`);

    wait().then(() => {
      expect(this.$('.storage-name')).to.exist;
      expect(this.$('.storage-name')).to.contain(name);

      done();
    });
  });

});
