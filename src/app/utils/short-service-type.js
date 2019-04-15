/**
 * Converts service type name to short, internal type name, eg. onezone -> zone
 * 
 * @module utils/short-service-type
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function shortServiceType(type) {
  return type && type.substring(3);
}
