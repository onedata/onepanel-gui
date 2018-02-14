/**
 * A base class for both real onepanel-server and mocked one (to avoid code redundancy)
 *
 * It should not be used as a standalone service! (thus it's name is "private")
 *
 * @module services/-onepanel-server-base
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

import RequestErrorHandler from 'ember-onedata-onepanel-server/mixins/request-error-handler';
import ResponseValidator from 'ember-onedata-onepanel-server/mixins/response-validator';

export default Service.extend(RequestErrorHandler, ResponseValidator, {});
