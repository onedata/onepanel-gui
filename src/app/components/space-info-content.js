/**
 * Content of popup with information about space
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import SpaceInfoContent from 'onedata-gui-common/components/space-info-content';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import { getOnezoneUrl } from 'onedata-gui-common/utils/onedata-urls';

export default SpaceInfoContent.extend({
  router: service(),
  onezoneGui: service(),

  /**
   * @override
   */
  showLinkToFileBrowser: true,

  /**
   * @override
   */
  showLinkToSpace: true,

  /**
   * @override
   */
  linkToSpace: computed('space', function linkToSpace() {
    const {
      router,
      space,
    } = this.getProperties('router', 'space');
    const spaceId = space.entityId;
    return router.urlFor(
      'onedata.sidebar.content.aspect',
      'spaces', {
        queryParams: {
          options: serializeAspectOptions({ space: spaceId, tab: 'overview' }),
        },
      }
    );
  }),

  /**
   * @override
   */
  linkToFileBrowser: computed('space', function linkToFileBrowser() {
    const space = this.space;
    const spaceId = space.entityId;
    const onezoneOrigin = this.get('onezoneGui.onezoneOrigin');
    return getOnezoneUrl(onezoneOrigin, `onedata/spaces/${spaceId}/data`);
  }),
});
