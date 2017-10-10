/**
 * Adds tools for configuring files popularity for space view (`cluster-spaces-table-item`)
 * (currently not very advanced)
 *
 * @module mixins/components/space-files-popularity
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  /**
   * @virtual
   * @property space
   * @type {SpaceDetails}
   */

  /**
   * @type {Onepanel.FilesPopularity}
   */
  filesPopularity: computed.reads('space.filesPopularity'),
});
