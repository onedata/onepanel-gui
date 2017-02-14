import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('one-sidebar-toolbar', 'Integration | Component | one sidebar toolbar', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{one-sidebar-toolbar}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#one-sidebar-toolbar}}
      template block text
    {{/one-sidebar-toolbar}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
