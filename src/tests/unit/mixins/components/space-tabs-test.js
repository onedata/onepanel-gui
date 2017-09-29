// FIXME: tests temporarily disabled

// import { expect } from 'chai';
// import { describe, it } from 'mocha';
// import Ember from 'ember';
// import ComponentsComponentsSpaceTabsMixin from 'onepanel-gui/mixins/components/space-tabs';

// describe('Unit | Mixin | components/space tabs', function () {
//   it('enables tabSync', function () {
//     const ComponentsComponentsSpaceTabsObject =
//       Ember.Object.extend(ComponentsComponentsSpaceTabsMixin);
//     const subject = ComponentsComponentsSpaceTabsObject.create({
//       importEnabled: false,
//     });

//     subject.set('importEnabled', true);

//     expect(subject.get('tabSyncClass')).to.equal('enabled');
//   });

//   it('disables tabSync', function () {
//     const ComponentsComponentsSpaceTabsObject =
//       Ember.Object.extend(ComponentsComponentsSpaceTabsMixin);
//     const subject = ComponentsComponentsSpaceTabsObject.create({
//       importEnabled: true,
//     });

//     expect(subject.get('tabSyncClass')).to.equal('enabled');

//     subject.set('importEnabled', false);

//     expect(subject.get('tabSyncClass')).to.equal('disabled');
//   });

//   it('enables tabPopular', function () {
//     const ComponentsComponentsSpaceTabsObject =
//       Ember.Object.extend(ComponentsComponentsSpaceTabsMixin);
//     const subject = ComponentsComponentsSpaceTabsObject.create({
//       // before fetching
//       filesPopularity: undefined,
//     });

//     expect(subject.get('tabPopularClass'), 'before fetching')
//       .to.equal('disabled');

//     subject.set('filesPopularity', {
//       enabled: true,
//     });

//     expect(subject.get('tabPopularClass'), 'after setting')
//       .to.equal('enabled');
//   });

//   it('disables tabPopular', function () {
//     const ComponentsComponentsSpaceTabsObject =
//       Ember.Object.extend(ComponentsComponentsSpaceTabsMixin);
//     const subject = ComponentsComponentsSpaceTabsObject.create({
//       filesPopularity: {
//         enabled: true,
//       },
//     });

//     expect(subject.get('tabPopularClass'), 'before disable')
//       .to.equal('enabled');

//     subject.set('filesPopularity', {
//       enabled: false,
//     });

//     expect(subject.get('tabPopularClass'), 'after disable')
//       .to.equal('disabled');
//   });

//   it('enables tabClean', function () {
//     const ComponentsComponentsSpaceTabsObject =
//       Ember.Object.extend(ComponentsComponentsSpaceTabsMixin);
//     const subject = ComponentsComponentsSpaceTabsObject.create();

//     expect(subject.get('tabCleanClass'), 'before change').to.equal('disabled');

//     subject.set('autoCleaning', {
//       enabled: true,
//     });

//     expect(subject.get('tabCleanClass'), 'after change').to.equal('enabled');
//   });

//   it('disables tabClean', function () {
//     const ComponentsComponentsSpaceTabsObject =
//       Ember.Object.extend(ComponentsComponentsSpaceTabsMixin);
//     const subject = ComponentsComponentsSpaceTabsObject.create({
//       autoCleaning: {
//         enabled: true,
//       },
//     });

//     expect(subject.get('tabCleanClass'), 'before change').to.equal('enabled');

//     subject.set('autoCleaning', {
//       enabled: false,
//     });

//     expect(subject.get('tabCleanClass'), 'after change').to.equal('disabled');
//   });
// });
