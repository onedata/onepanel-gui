import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('one-sidebar-toolbar-button', 'Integration | Component | one sidebar toolbar button', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{one-sidebar-toolbar-button}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#one-sidebar-toolbar-button}}
      template block text
    {{/one-sidebar-toolbar-button}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
