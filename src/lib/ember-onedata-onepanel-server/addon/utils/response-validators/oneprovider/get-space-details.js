/**
 * Validate SpaceDetails data
 *
 * @module utils/response-validators/oneprovider/get-space-details
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 * @function
 * @param {object} data response data
 * @returns {boolean} true if response data is valid
 */
export default function (data) {
  try {
    return !!(
      data.id &&
      data.name &&
      typeof data.supportingProviders === 'object' &&
      (
        data.autoCleaning == null ||
        data.autoCleaning.enabled === false ||
        validateAutoCleaningSettings(data.autoCleaning.settings)
      )
    );
  } catch (error) {
    if (error instanceof TypeError) {
      return false;
    } else {
      throw error;
    }
  }
}

const cleanSettingsProps = [
  'fileSizeGreaterThan',
  'fileSizeLessThan',
  'fileNotActiveHours',
  'threshold',
  'target',
];

/** 
 * @param {Onepanel.SpaceAutoCleaningSettings} settings
 * @returns {boolean} true if valid
 */
function validateAutoCleaningSettings(settings) {
  return settings != null && cleanSettingsProps.every(prop =>
    settings[prop] === null || typeof settings[prop] === 'number'
  );
}
