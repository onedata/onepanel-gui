import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click, fillIn } from 'ember-native-dom-helpers';

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

    click('.first-item-header .one-checkbox').then(() => {
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

    click('.first-item-header .one-checkbox').then(() => {
      click('.first-item-header .one-checkbox').then(() => {
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

    click('.first-item-header input').then(() => {
      expect(this.$('.first-item-header input')).to.be.disabled;
      expect(selectionChanged).to.be.false;
      done();
    });
  });

  it('can select all items', function (done) {
    let selectionChanged = false;
    this.set('selectionChangedHandler', function (valuesSelected) {
      expect(valuesSelected.length).to.be.equal(2);
      expect(valuesSelected.indexOf(1)).to.be.gt(-1);
      expect(valuesSelected.indexOf(2)).to.be.gt(-1);
      selectionChanged = true;
    });

    this.render(hbs `
    {{#one-collapsible-list
      hasCheckboxes=true
      selectionChanged=(action selectionChangedHandler)
      as |list|}}
      {{list.header}}
      {{#list.item selectionValue=1 as |listItem|}}
        {{#listItem.header}}
          <h1>Some header</h1>
        {{/listItem.header}}
      {{/list.item}}
      {{#list.item selectionValue=2 as |listItem|}}
        {{#listItem.header}}
          <h1>Some header</h1>
        {{/listItem.header}}
      {{/list.item}}
    {{/one-collapsible-list}}
    `);

    wait().then(() => {
      click('.one-collapsible-list-header .one-checkbox').then(() => {
        expect(selectionChanged).to.be.true;
        done();
      });
    });
  });

  it('can filter items', function (done) {
    this.render(hbs `
     {{#one-collapsible-list as |list|}}
      {{list.header}}
      {{#list.item as |listItem|}}
        {{#listItem.header}}
          <h1>item1</h1>
        {{/listItem.header}}
      {{/list.item}}
      {{#list.item as |listItem|}}
        {{#listItem.header}}
          <h1>item2</h1>
        {{/listItem.header}}
      {{/list.item}}
    {{/one-collapsible-list}}
    `);

    fillIn('.one-collapsible-list-header .search-bar', 'item1').then(() => {
      expect(this.$('.one-collapsible-list-item.collapse-hidden'))
        .to.have.length(1);
      done();
    });
  });

  it('shows filtered out and checked items', function (done) {
    this.render(hbs `
    {{#one-collapsible-list
      hasCheckboxes=true
      as |list|}}
      {{list.header}}
      {{#list.item class="item1" selectionValue=1 as |listItem|}}
        {{#listItem.header}}
          <h1>item1</h1>
        {{/listItem.header}}
      {{/list.item}}
      {{#list.item selectionValue=2 as |listItem|}}
        {{#listItem.header}}
          <h1>item2</h1>
        {{/listItem.header}}
      {{/list.item}}
    {{/one-collapsible-list}}
    `);

    click('.item1 .one-checkbox').then(() => {
      fillIn('.one-collapsible-list-header .search-bar', 'item2').then(() => {
        let item1 = this.$('.item1');
        expect(item1).to.have.class('selected');
        expect(item1).not.to.have.class('collapse-hidden');
        expect(item1.find('.header-fixed')).to.have.length(1);
        done();
      });
    });
  });
});
