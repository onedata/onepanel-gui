import providers from './tabs/providers';
import clusters from './tabs/clusters';
import tokens from './tabs/tokens';
import spaces from './tabs/spaces';
import groups from './tabs/groups';
import shares from './tabs/shares';
import harvesters from './tabs/harvesters';
import atmInventories from './tabs/atm-inventories';
import users from './tabs/users';

import clusterStorageAddForm from './components/cluster-storage-add-form';
import supportSpaceForm from './components/support-space-form';
import storageItem from './components/storage-item';
import clusterSpacesTableItem from './components/cluster-spaces-table-item';
import clusterSpacesTable from './components/cluster-spaces-table';
import storageImportForm from './components/storage-import-form';
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
import newClusterSummary from './components/new-cluster-summary';
import newClusterWelcome from './components/new-cluster-welcome';
import contentClustersProvider from './components/content-clusters-provider';
import newCluster from './components/new-cluster';
import modalRedirect from './components/modal-redirect';
import clusterHostIpForm from './components/cluster-host-ip-form';
import noEmergencyPassphraseBox from './components/no-emergency-passphrase-box';
import firstEmergencyPassphraseForm from './components/first-emergency-passphrase-form';
import clusterHostTable from './components/cluster-host-table';
import clusterHostTableRow from './components/cluster-host-table-row';
import manageClusterStorages from './components/manage-cluster-storages';
import contentClustersCertificate from './components/content-clusters-certificate';
import webCertForm from './components/web-cert-form';
import newClusterWebCert from './components/new-cluster-web-cert';
import modalConfigureWebCert from './components/modal-configure-web-cert';
import newClusterDns from './components/new-cluster-dns';
import clusterDnsCheckTable from './components/cluster-dns-check-table';
import contentClustersDns from './components/content-clusters-dns';
import clusterDns from './components/cluster-dns';
import newClusterCeph from './components/new-cluster-ceph';
import cephClusterConfiguration from './components/ceph-cluster-configuration';
import clusterCephStatus from './components/cluster-ceph-status';
import clusterCephPools from './components/cluster-ceph-pools';
import contentClustersCeph from './components/content-clusters-ceph';
import contentClustersEmergencyPassphrase from './components/content-clusters-emergency-passphrase';
import clusterNodesTile from './components/cluster-nodes-tile';
import clusterSpacesTile from './components/cluster-spaces-tile';
import clusterStoragesTile from './components/cluster-storages-tile';
import contentClustersOverview from './components/content-clusters-overview';
import onezoneInfoBox from './components/onezone-info-box';
import sidebarClusters from './components/sidebar-clusters';
import spaceStorageImport from './components/space-storage-import';
import supportSizeInfo from './components/support-size-info';
import emergencyWarningBar from './components/emergency-warning-bar';
import registerOnezoneNotCompatible from './components/alerts/register-onezone-not-compatible';
import registerOnezoneOffline from './components/alerts/register-onezone-offline';
import contentClustersMembers from './components/content-clusters-members';
import contentClustersGuiSettings from './components/content-clusters-gui-settings';

import clusterIpsConfigurator from './mixins/components/cluster-ips-configurator';
import spaceTabs from './mixins/components/space-tabs';

import guiUtils from './services/gui-utils';
import storageActions from './services/storage-actions';
import clusterActions from './services/cluster-actions';
import onezoneGui from './services/onezone-gui';
import guiSettingsActions from './services/gui-settings-actions';

import onedata from './routes/onedata';

import newClusterDeployProcess from './utils/new-cluster-deploy-process';

import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';

const translations = {
  tabs: {
    undefined: {
      menuItem: '',
    },
    providers,
    tokens,
    spaces,
    shares,
    groups,
    users,
    clusters,
    harvesters,
    atmInventories,
  },
  components: {
    clusterStorageAddForm,
    supportSpaceForm,
    storageItem,
    clusterSpacesTable,
    clusterSpacesTableItem,
    storageImportForm,
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
    noEmergencyPassphraseBox,
    firstEmergencyPassphraseForm,
    clusterHostTable,
    clusterHostTableRow,
    manageClusterStorages,
    contentClustersCertificate,
    webCertForm,
    newClusterWebCert,
    modalConfigureWebCert,
    newClusterDns,
    newClusterSummary,
    newClusterWelcome,
    clusterDnsCheckTable,
    contentClustersDns,
    clusterDns,
    newClusterCeph,
    cephClusterConfiguration,
    clusterCephStatus,
    clusterCephPools,
    contentClustersCeph,
    contentClustersEmergencyPassphrase,
    clusterNodesTile,
    clusterSpacesTile,
    clusterStoragesTile,
    contentClustersOverview,
    onezoneInfoBox,
    sidebarClusters,
    spaceStorageImport,
    supportSizeInfo,
    emergencyWarningBar,
    contentClustersMembers,
    contentClustersGuiSettings,
    alerts: {
      registerOnezoneOffline,
      registerOnezoneNotCompatible,
    },
  },
  mixins: {
    components: {
      clusterIpsConfigurator,
      spaceTabs,
    },
  },
  services: {
    guiUtils,
    storageActions,
    clusterActions,
    onezoneGui,
    guiSettingsActions,
  },
  routes: {
    onedata,
  },
  utils: {
    newClusterDeployProcess,
  },
};

export default _.merge({}, onedataCommonTranslations, translations);
