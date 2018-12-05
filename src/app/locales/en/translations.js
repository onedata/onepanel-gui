import clusters from './tabs/clusters';
import users from './tabs/users';

import clusterStorageAddForm from './components/cluster-storage-add-form';
import supportSpaceForm from './components/support-space-form';
import storageItem from './components/storage-item';
import clusterSpacesTableItem from './components/cluster-spaces-table-item';
import clusterSpacesTable from './components/cluster-spaces-table';
import storageImportUpdateForm from './components/storage-import-update-form';
import spaceStatusIcons from './components/space-status-icons';
import loginBox from './components/login-box';
import providerRegistrationForm from './components/provider-registration-form';
import spaceFilePopularity from './components/space-file-popularity';
import spaceFilePopularityConfiguration from './components/space-file-popularity-configuration';
import spaceAutoCleaning from './components/space-auto-cleaning';
import spaceCleaningReports from './components/space-cleaning-reports';
import spaceCleaningBarChart from './components/space-cleaning-bar-chart';
import spaceCleaningConditionsForm from './components/space-cleaning-conditions-form';
import spaceOverview from './components/space-overview';
import newClusterZoneRegistration from './components/new-cluster-zone-registration';
import deregisterProviderConfirm from './components/deregister-provider-confirm';
import contentClustersSpaces from './components/content-clusters-spaces';
import contentClustersSpacesList from './components/content-clusters-spaces-list';
import contentClustersSpacesShow from './components/content-clusters-spaces-show';
import contentClustersNodes from './components/content-clusters-nodes';
import newClusterDeployProgress from './components/new-cluster-deploy-progress';
import newClusterInstallation from './components/new-cluster-installation';
import newClusterIps from './components/new-cluster-ips';
import contentClustersProvider from './components/content-clusters-provider';
import newCluster from './components/new-cluster';
import modalRedirect from './components/modal-redirect';
import clusterHostIpForm from './components/cluster-host-ip-form';
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
import spaceStorageSynchronization from './components/space-storage-synchronization';
import supportSizeInfo from './components/support-size-info';

import clusterIpsConfigurator from './mixins/components/cluster-ips-configurator';
import spaceTabs from './mixins/components/space-tabs';

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
    clusterSpacesTable,
    clusterSpacesTableItem,
    storageImportUpdateForm,
    spaceStatusIcons,
    loginBox,
    providerRegistrationForm,
    spaceFilePopularity,
    spaceFilePopularityConfiguration,
    spaceAutoCleaning,
    spaceCleaningReports,
    spaceCleaningBarChart,
    spaceCleaningConditionsForm,
    spaceOverview,
    newClusterZoneRegistration,
    deregisterProviderConfirm,
    contentClustersSpaces,
    contentClustersSpacesList,
    contentClustersSpacesShow,
    newClusterDeployProgress,
    newClusterInstallation,
    newClusterIps,
    contentClustersProvider,
    newCluster,
    modalRedirect,
    clusterHostIpForm,
    contentClustersNodes,
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
    spaceStorageSynchronization,
    supportSizeInfo,
  },
  mixins: {
    components: {
      clusterIpsConfigurator,
      spaceTabs,
    },
  },
  services: {
    guiUtils,
  },
};

export default _.merge({}, onedataCommonTranslations, translations);
