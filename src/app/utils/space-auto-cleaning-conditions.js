/**
 * Utils and constants to use Number values for validating, enabling and disabling
 * space auto cleaning conditions
 *
 * Using Numbers instead of nulls because of lack of support for mixed
 * Number/null type in Swagger 2.0
 *
 * @module utils/space-auto-cleaning-conditions
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * Maximal value in bytes of file sizes fields in space auto cleaning settings
 * Equals 1 PiB
 */
export const MAX_FILE_SIZE = 1125899906842624;

/**
 * Minimal possible value in bytes of "file size greater than"
 */
export const MIN_LOWER_FILE_SIZE_LIMIT = 2;

/**
 * Minimal possible value in bytes of "file size less than"
 */
export const MIN_UPPER_FILE_SIZE_LIMIT = 1;

/**
 * Minimal possible value in hours of "file not active for"
 * 0 hours makes no sense, because all files are affected
 */
export const MIN_MAX_FILE_NOT_OPENED_HOURS = 1;

/**
 * Maximal possible value in hours of "file not active for"
 * Approx. 47 years
 */
export const MAX_MAX_FILE_NOT_OPENED_HOURS = 1482192000;

/**
 * A value to disable lowerFileSizeLimit condition
 */
export const DISABLE_LOWER_FILE_SIZE_LIMIT = MIN_LOWER_FILE_SIZE_LIMIT - 1;

/**
 * A value to disable upperFileSizeLimit condition
 */
export const DISABLE_UPPER_FILE_SIZE_LIMIT = MAX_FILE_SIZE + 1;

/**
 * A value to disable for fileNotActiveForHours condition
 */
export const DISABLE_MAX_FILE_NOT_OPENED_HOURS = MAX_MAX_FILE_NOT_OPENED_HOURS + 1;

/**
 * @param {Number} value number of bytes
 * @returns {boolean} true if value means enabled condition; false otherwise
 */
export function valid_lowerFileSizeLimit(value) {
  return value > DISABLE_LOWER_FILE_SIZE_LIMIT && value <= MAX_FILE_SIZE;
}

/**
 * @param {Number} value number of bytes
 * @returns {boolean} true if value means enabled condition; false otherwise
 */
export function valid_upperFileSizeLimit(value) {
  return value >= MIN_UPPER_FILE_SIZE_LIMIT && value < DISABLE_UPPER_FILE_SIZE_LIMIT;
}

/**
 * @param {Number} value number of bytes
 * @returns {boolean} true if value means enabled condition; false otherwise
 */
export function valid_maxFileNotOpenedHours(value) {
  return value >= MIN_MAX_FILE_NOT_OPENED_HOURS &&
    value < DISABLE_MAX_FILE_NOT_OPENED_HOURS;
}
