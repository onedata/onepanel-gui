/**
 * Exports a real onepanelServer service or its mock.
 * @module onepanel-server/service/onepanel-server
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnepanelServer from 'ember-onedata-onepanel-server/services/onepanel-server';
import OnepanelServerMock from 'ember-onedata-onepanel-server/services/onepanel-server-mock';

import config from 'ember-get-config';

const {
  APP: {
    MOCK_BACKEND
  }
} = config;

let ExportServer;
if (MOCK_BACKEND) {
  ExportServer = OnepanelServerMock;
} else {
  ExportServer = OnepanelServer;
}

export default ExportServer;
