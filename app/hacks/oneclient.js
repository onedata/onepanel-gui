import Ember from 'ember';

const {
  RSVP: {
    Promise
  }
} = Ember;

import Onepanel from 'npm:onepanel';

const origCallApi = Onepanel.ApiClient.callApi;

Onepanel.ApiClient.callApi = function (path, httpMethod, pathParams,
  queryParams, headerParams, formParams, bodyParam, contentTypes, accepts,
  returnType) {

  return new Promise((resolve, reject) => {
    let callback = (error, data, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(data, response);
      }
    };

    origCallApi(path, httpMethod, pathParams,
      queryParams, headerParams, formParams, bodyParam, contentTypes, accepts,
      returnType, callback);
  });
};

export default Onepanel;
