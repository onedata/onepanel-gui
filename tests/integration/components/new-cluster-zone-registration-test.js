import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('new-cluster-zone-registration', 'Integration | Component | new cluster zone registration', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{new-cluster-zone-registration}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#new-cluster-zone-registration}}
      template block text
    {{/new-cluster-zone-registration}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
