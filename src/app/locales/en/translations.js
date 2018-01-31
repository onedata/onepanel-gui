import clusterStorageAddForm from './components/cluster-storage-add-form';
import supportSpaceForm from './components/support-space-form';
import storageItem from './components/storage-item';
import clusterSpacesTableItem from './components/cluster-spaces-table-item';
import storageImportUpdateForm from './components/storage-import-update-form';
import spaceStatusIcons from './components/space-status-icons';
import brandInfo from './components/brand-info';
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
import newClusterDeployProgress from './components/new-cluster-deploy-progress';
import newClusterProviderCert from './components/new-cluster-provider-cert';
import newClusterInstallation from './components/new-cluster-installation';
import contentClustersProvider from './components/content-clusters-provider';
import newCluster from './components/new-cluster';

import _ from 'lodash';
import onedataCommonTranslations from './onedata-gui-common';

let translations = {
  components: {
    clusterStorageAddForm,
    supportSpaceForm,
    storageItem,
    clusterSpacesTableItem,
    storageImportUpdateForm,
    spaceStatusIcons,
    brandInfo,
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
    newClusterProviderCert,
    newClusterInstallation,
    contentClustersProvider,
    newCluster,
  },
};

export default _.merge({}, onedataCommonTranslations, translations);
