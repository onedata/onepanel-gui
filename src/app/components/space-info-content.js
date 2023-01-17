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
import { Promise } from 'rsvp';
import { getOnezoneUrl } from 'onedata-gui-common/utils/onedata-urls';

export default SpaceInfoContent.extend({
  router: service(),
  guiUtils: service(),
  onezoneGui: service(),

  showLinkToFileBrowser: true,

  showLinkToSpace: true,

  linkToSpace: computed('space', function link() {
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

  actions: {
    openFileBrowser() {
      const space = this.space;
      const spaceId = space.entityId;
      const onezoneOrigin = this.get('onezoneGui.onezoneOrigin');
      return new Promise(() => {
        const url = getOnezoneUrl(onezoneOrigin, `onedata/spaces/${spaceId}/data`);
        window.location = url;
      });
    },
  },
});
