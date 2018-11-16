import clusters from './tabs/clusters';
import users from './tabs/users';

import clusterStorageAddForm from './components/cluster-storage-add-form';
import supportSpaceForm from './components/support-space-form';
import storageItem from './components/storage-item';
import clusterSpacesTableItem from './components/cluster-spaces-table-item';
import storageImportUpdateForm from './components/storage-import-update-form';
import spaceStatusIcons from './components/space-status-icons';
import loginBox from './components/login-box';
import providerRegistrationForm from './components/provider-registration-form';
import spaceFilesPopularity from './components/space-files-popularity';
import spaceAutoCleaning from './components/space-auto-cleaning';
import spaceCleaningReports from './components/space-cleaning-reports';
import spaceCleaningBarChart from './components/space-cleaning-bar-chart';
import spaceCleaningConditionsForm from './components/space-cleaning-conditions-form';
import newClusterZoneRegistration from './components/new-cluster-zone-registration';
import deregisterProviderConfirm from './components/deregister-provider-confirm';
import contentClustersSpaces from './components/content-clusters-spaces';
import contentClustersNodes from './components/content-clusters-nodes';
import newClusterDeployProgress from './components/new-cluster-deploy-progress';
import newClusterInstallation from './components/new-cluster-installation';
import newClusterIps from './components/new-cluster-ips';
import contentClustersProvider from './components/content-clusters-provider';
import newCluster from './components/new-cluster';
import modalRedirect from './components/modal-redirect';
import clusterHostIpForm from './components/cluster-host-ip-form';
import noAdminBox from './components/no-admin-box';
import createAdminForm from './components/create-admin-form';
import clusterHostTable from './components/cluster-host-table';
import clusterHostTableRow from './components/cluster-host-table-row';
import manageClusterStorages from './components/manage-cluster-storages';
import sidebarClusters from './components/sidebar-clusters';
import contentClustersCertificate from './components/content-clusters-certificate';
import webCertForm from './components/web-cert-form';
import newClusterWebCert from './components/new-cluster-web-cert';
import modalConfigureWebCert from './components/modal-configure-web-cert';
import newClusterDns from './components/new-cluster-dns';
import clusterDnsCheckTable from './components/cluster-dns-check-table';
import contentClustersDns from './components/content-clusters-dns';
import clusterDns from './components/cluster-dns';
import contentUsers from './components/content-users';

import clusterIpsConfigurator from './mixins/components/cluster-ips-configurator';

import guiUtils from './services/gui-utils';

import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';

let translations = {
  tabs: {
    clusters,
    users,
  },
  components: {
    clusterStorageAddForm,
    supportSpaceForm,
    storageItem,
    clusterSpacesTableItem,
    storageImportUpdateForm,
    spaceStatusIcons,
    loginBox,
    providerRegistrationForm,
    spaceFilesPopularity,
    spaceAutoCleaning,
    spaceCleaningReports,
    spaceCleaningBarChart,
    spaceCleaningConditionsForm,
    newClusterZoneRegistration,
    deregisterProviderConfirm,
    contentClustersSpaces,
    newClusterDeployProgress,
    newClusterInstallation,
    newClusterIps,
    contentClustersProvider,
    newCluster,
    modalRedirect,
    clusterHostIpForm,
    contentClustersNodes,
    noAdminBox,
    createAdminForm,
    clusterHostTable,
    clusterHostTableRow,
    manageClusterStorages,
    sidebarClusters,
    contentClustersCertificate,
    webCertForm,
    newClusterWebCert,
    modalConfigureWebCert,
    newClusterDns,
    clusterDnsCheckTable,
    contentClustersDns,
    clusterDns,
    contentUsers,
  },
  mixins: {
    components: {
      clusterIpsConfigurator,
    },
  },
  services: {
    guiUtils,
  },
};

export default _.merge({}, onedataCommonTranslations, translations);
