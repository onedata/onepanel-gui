/**
 * Report item in desktop mode
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DataItemBase from './-data-item-base';

export default DataItemBase.extend({
  tagName: 'tr',
  classNames: ['data-row'],
  attributeBindings: ['dataRowId:data-row-id'],
});
