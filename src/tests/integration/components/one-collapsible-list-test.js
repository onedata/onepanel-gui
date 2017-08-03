import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | one collapsible list', function () {
  setupComponentTest('one-collapsible-list', {
    integration: true
  });

  it('handles item select', function (done) {
    let selectionChanged = false;
    let itemValue = 1;
    this.setProperties({
      itemValue,
      selectionChangedHandler: function (values) {
        selectionChanged = true;
        expect(values).to.have.length(1);
        expect(values[0]).to.be.equal(itemValue);
      }
    });

    this.render(hbs `
    {{#one-collapsible-list
      hasCheckboxes=true
      selectionChanged=(action selectionChangedHandler)
      as |list|}}
      {{#list.item selectionValue=itemValue as |listItem|}}
        {{#listItem.header class="first-item-header"}}
          <h1>Some header</h1>
        {{/listItem.header}}
        {{#listItem.content}}
          some content
        {{/listItem.content}}
      {{/list.item}}
    {{/one-collapsible-list}}
    `);

    this.$('.first-item-header input').click();
    wait().then(() => {
      expect(selectionChanged).to.be.true;
      done();
    });
  });

  it('handles item deselect', function (done) {
    let itemValue = 1;
    let changeCounter = 0;
    this.setProperties({
      itemValue,
      selectionChangedHandler: function (values) {
        if (changeCounter === 1) {
          expect(values).to.have.length(0);
        }
        changeCounter++;
      }
    });

    this.render(hbs `
    {{#one-collapsible-list
      hasCheckboxes=true
      selectionChanged=(action selectionChangedHandler)
      as |list|}}
      {{#list.item selectionValue=itemValue as |listItem|}}
        {{#listItem.header class="first-item-header"}}
          <h1>Some header</h1>
        {{/listItem.header}}
        {{#listItem.content}}
          some content
        {{/listItem.content}}
      {{/list.item}}
    {{/one-collapsible-list}}
    `);

    this.$('.first-item-header input').click();
    wait().then(() => {
      this.$('.first-item-header input').click();
      wait().then(() => {
        expect(changeCounter).to.be.equal(2);
        done();
      });
    });
  });

  it('ignores item selection if selectionValue is not set', function (done) {
    let selectionChanged = false;
    this.set('selectionChangedHandler', function () {
      selectionChanged = true;
    });

    this.render(hbs `
    {{#one-collapsible-list
      hasCheckboxes=true
      selectionChanged=(action selectionChangedHandler)
      as |list|}}
      {{#list.item as |listItem|}}
        {{#listItem.header class="first-item-header"}}
          <h1>Some header</h1>
        {{/listItem.header}}
        {{#listItem.content}}
          some content
        {{/listItem.content}}
      {{/list.item}}
    {{/one-collapsible-list}}
    `);

    this.$('.first-item-header input').click();
    wait().then(() => {
      expect(this.$('.first-item-header input')).to.be.disabled;
      expect(selectionChanged).to.be.false;
      done();
    });
  });
});
