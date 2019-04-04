/**
 * Utils and constants to use Number values for validating, enabling and disabling
 * space auto-cleaning conditions
 *
 * Using Numbers instead of nulls because of lack of support for mixed
 * Number/null type in Swagger 2.0
 *
 * @module utils/space-auto-cleaning-conditions
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * Maximal value in bytes of file sizes fields in space auto-cleaning settings
 * Equals 1 PiB
 */
export const MAX_FILE_SIZE = 1125899906842624;

/**
 * Min value to input into: `maxOpenCount`, `max[Hourly/Daily/Monthly]MovingAverage`
 */
export const MIN_OPEN_COUNT = 1;

/**
 * Minimal possible value in bytes of "file size greater than"
 */
export const MIN_LOWER_FILE_SIZE_LIMIT = 1;

/**
 * Minimal possible value in bytes of "file size less than"
 */
export const MIN_UPPER_FILE_SIZE_LIMIT = 1;

/**
 * Minimal possible value in hours of "file not active for"
 * 0 hours makes no sense, because all files are affected
 */
export const MIN_MIN_HOURS_SINCE_LAST_OPEN = 1;

/**
 * Maximal possible value in hours of "file not active for"
 * Approx. 47 years
 */
export const MAX_MIN_HOURS_SINCE_LAST_OPEN = 1482192000;

/**
 * Max value to input into: `maxOpenCount`, `max[Hourly/Daily/Monthly]MovingAverage`
 */
export const MAX_OPEN_COUNT = Number.MAX_SAFE_INTEGER - 1;
