/**
 * Extracts nested error from container error. If passed error is not an container error,
 * then the passed error is returned
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function extractNestedError(error) {
  const rootErrorId = error && error.id;

  if (rootErrorId === 'errorOnNodes') {
    return error.details.error;
  } else {
    return error;
  }
}
