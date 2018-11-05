import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  /**
   * @override
   */
  i18nPrefix: 'components.newClusterCeph',

  /**
   * @type {function}
   */
  nextStep: notImplementedThrow,

  /**
   * @type {function}
   */
  prevStep: notImplementedThrow,

  /**
   * @type {Utils/NewClusterDeployProcess}
   */
  stepData: undefined,

  /**
   * @type {Ember.ComputedProperty<Utils/NewClusterDeployProcess>}
   */
  clusterDeployProcess: alias('stepData'),

  actions: {
    prevStep() {
      const {
        prevStep,
        stepData,
      } = this.getProperties('prevStep', 'stepData');
      prevStep(stepData);
    },
  },
});
