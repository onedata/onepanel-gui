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
export const MIN_GREATER_FILE_SIZE = 1;

/**
 * Minimal possible value in bytes of "file size less than"
 */
export const MIN_LESS_FILE_SIZE = 1;

/**
 * Minimal possible value in hours of "file not active for"
 * 0 hours makes no sense, because all files are affected
 */
export const MIN_FILE_HOURS = 1;

/**
 * Maximal possible value in hours of "file not active for"
 * Approx. 47 years
 */
export const MAX_FILE_HOURS = 1482192000;

/**
 * A value to disable fileSizeGreaterThan condition
 */
export const DISABLE_GREATER_FILE_SIZE = MIN_GREATER_FILE_SIZE - 1;

/**
 * A value to disable fileSizeLessThan condition
 */
export const DISABLE_LESS_FILE_SIZE = MAX_FILE_SIZE + 1;

/**
 * A value to disable for fileNotActiveForHours condition
 */
export const DISABLE_FILE_HOURS = MAX_FILE_HOURS + 1;

/**
 * @param {Number} value number of bytes
 * @returns {boolean} true if value means enabled condition; false otherwise
 */
export function validFileGreaterThan(value) {
  return value > DISABLE_GREATER_FILE_SIZE && value <= MAX_FILE_SIZE;
}

/**
 * @param {Number} value number of bytes
 * @returns {boolean} true if value means enabled condition; false otherwise
 */
export function validFileLessThan(value) {
  return value >= MIN_LESS_FILE_SIZE && value < DISABLE_LESS_FILE_SIZE;
}

/**
 * @param {Number} value number of bytes
 * @returns {boolean} true if value means enabled condition; false otherwise
 */
export function validFileNotActiveHours(value) {
  return value >= MIN_FILE_HOURS && value < DISABLE_FILE_HOURS;
}
