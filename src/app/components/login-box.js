import Ember from 'ember';

import LoginBox from 'onedata-gui-common/components/login-box';

const {
  inject: { service },
  computed,
  computed: { readOnly },
} = Ember;

// TODO: login box should use login-box/header component for custom header

export default LoginBox.extend({
  i18n: service(),
  onepanelServer: service(),

  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  loginMainTitleClass: readOnly('onepanelServiceType'),

  brandTitle: computed('onepanelServiceType', function () {
    let {
      i18n,
      onepanelServiceType,
    } = this.getProperties('i18n', 'onepanelServiceType');
    return onepanelServiceType ?
      'One' + i18n.t(`components.brandInfo.serviceType.${onepanelServiceType}`) :
      null;
  }),
});
