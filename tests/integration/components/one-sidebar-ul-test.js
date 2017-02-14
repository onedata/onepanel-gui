import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('one-sidebar-ul', 'Integration | Component | one sidebar ul', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{one-sidebar-ul}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#one-sidebar-ul}}
      template block text
    {{/one-sidebar-ul}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
