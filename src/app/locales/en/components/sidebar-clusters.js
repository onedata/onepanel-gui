import _ from 'lodash';
import SidebarClusters from '../onedata-gui-common/components/sidebar-clusters';

export default _.merge({}, SidebarClusters, {
  secondLevelItems: {
    dnsWarning: 'Some problems with your DNS configuration have been detected',
    webCertWarning: 'Some problems with your web certificate have been detected',
  },
});
