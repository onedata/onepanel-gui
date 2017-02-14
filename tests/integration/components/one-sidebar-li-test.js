import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('one-sidebar-li', 'Integration | Component | one sidebar li', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{one-sidebar-li}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#one-sidebar-li}}
      template block text
    {{/one-sidebar-li}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
