import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import OnedataRoute from 'onedata-gui-common/routes/onedata';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default OnedataRoute.extend(I18n, {
  clusterModelManager: service(),
  onepanelServer: service(),
  configurationManager: service(),
  onepanelConfiguration: service(),

  /**
   * @override
   */
  i18nPrefix: 'routes.onedata',

  beforeModel() {
    this._super(...arguments);
    if (this.get('onepanelServer.isInitialized')) {
      return Promise.all([
        this.get('clusterModelManager').getCurrentClusterProxy(),
        this.get('onepanelConfiguration').updateConfigurationProxy(),
      ]);
    } else {
      this.transitionTo('login');
    }
  },

  model() {
    const isHosted = Boolean(this.get('onepanelServer').getClusterIdFromUrl());
    return Promise.all([
      this._super(...arguments),
      this.get('configurationManager').getInstallationDetails(),
    ]).then(([model, installDetails]) => {
      if (!isHosted) {
        const items = get(model, 'mainMenuItems');
        if (get(installDetails, 'isInitialized') === false) {
          set(
            model,
            'mainMenuItems',
            items.filter(item => get(item, 'id') === 'clusters')
          );
        } else {
          items.forEach(item => {
            if (get(item, 'id') !== 'clusters') {
              setProperties(item, {
                disabled: true,
                tip: this.t('useOnezoneToAccess'),
              });
            }
          });
        }
      }
      return model;
    });
  },
});
