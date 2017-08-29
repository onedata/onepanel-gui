import clusterStorageAddForm from './components/cluster-storage-add-form';
import supportSpaceForm from './components/support-space-form';
import storageItem from './components/storage-item';
import clusterSpacesTableItem from './components/cluster-spaces-table-item';
import storageImportUpdateForm from './components/storage-import-update-form';
import spaceStatusIcons from './components/space-status-icons';
import brandInfo from './components/brand-info';
import loginBox from './components/login-box';
import spaceSupportChart from './components/space-support-chart';

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
    spaceSupportChart,
  },
};

export default _.merge({}, onedataCommonTranslations, translations);
