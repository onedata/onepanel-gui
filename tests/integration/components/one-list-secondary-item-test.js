import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('one-list-secondary-item', 'Integration | Component | one list secondary item', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{one-list-secondary-item}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#one-list-secondary-item}}
      template block text
    {{/one-list-secondary-item}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
