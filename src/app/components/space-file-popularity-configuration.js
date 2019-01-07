/**
 * Auto-saved form with configuration of file-popularity function
 * 
 * @module components/space-file-popularity-configuration
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import { buildValidations } from 'ember-cp-validations';
import AutoSaveForm from 'onedata-gui-common/mixins/components/auto-save-form';

const lastOpenHourWeightField = {
  type: 'number',
  gte: 0,
};
const avgOpenCountPerDayWeightField = {
  type: 'number',
  gte: 0,
};
const maxAvgOpenCountPerDayField = {
  type: 'number',
  gte: 0,
};

const validators = {
  'formData.lastOpenHourWeight': createFieldValidator(lastOpenHourWeightField),
  'formData.avgOpenCountPerDayWeight': createFieldValidator(
    avgOpenCountPerDayWeightField
  ),
  'formData.maxAvgOpenCountPerDay': createFieldValidator(maxAvgOpenCountPerDayField),
};

export default Component.extend(
  AutoSaveForm,
  I18n,
  buildValidations(validators), {
    classNames: ['space-file-popularity-configuration', 'auto-save-form'],
    i18nPrefix: 'components.spaceFilePopularityConfiguration',

    /**
     * @virtual
     * @type {Onepanel.SpaceFilePopularityConfiguration}
     */
    configuration: undefined,

    /**
     * Array of field names.
     * @type {ComputedProperty<Array<string>>}
     */
    sourceFieldNames: Object.freeze([
      'lastOpenHourWeight',
      'avgOpenCountPerDayWeight',
      'maxAvgOpenCountPerDay',
    ]),
  });
