/**
 * A service that provides method to extract Onepanel-specific error messages
 * from passed backend errors.
 * 
 * @module services/error-extractor
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ErrorExtractor from 'onedata-gui-common/services/error-extractor';
import getErrorDescription from 'onepanel-gui/utils/get-error-description';

export default ErrorExtractor.extend({
  /**
   * @override
   */
  extractorFunction: getErrorDescription,
});
