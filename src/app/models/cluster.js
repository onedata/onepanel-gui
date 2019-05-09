/**
 * Additional computed properties for backend and cluster-model-manager cluster
 * data.
 * 
 * @module models/cluster
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import ClusterOnlineCheck from 'onedata-gui-common/mixins/cluster-online-check';

export default EmberObject.extend(ClusterOnlineCheck);
