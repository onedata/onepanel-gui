/**
 * Gets task ID from ClusterApi.getTaskStatus response.
 *
 * See the tasks API of Onepanel:
 * https://github.com/onedata/onepanel-javascript-client/blob/develop/docs/TaskStatus.md
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function (response) {
  if (response?.headers?.location) {
    const match = response.headers.location.match(/^.*\/tasks\/(.*)$/);
    return match && match[1];
  } else {
    return response?.body?.taskId;
  }
}
