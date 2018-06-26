export default {
  clusterDeployment: 'Cluster deployment',
  deploy: 'Deploy',
  zoneOptions: 'Zone options',
  clusterHosts: 'Cluster hosts',
  domainInfo: 'Note: to ensure that Providers can use subdomain delegation in ' +
    'your Zone, you need to properly set up DNS zone delegation. ' +
    'For more information, see',
  domainLink: 'the documentation',
  addNewHost: 'Add new host',
  newHostnameExample: 'Enter hostname or IP address',
  save: 'Add host',
  cancel: 'Cancel',
  addingNewHost: 'adding new host',
  showAddInformation: 'Show instructions...',
  hideAddInformation: 'Hide instructions',
  addInfoStepsDescription: 'To add a new node to the cluster, follow these steps:',
  addInfoStep1: 'Install {{serviceName}} panel on the node.',
  addInfoStep2: 'Make sure that the following ports are open between cluster ' +
    'nodes hosting certain services:',
  addHostInfoClusterPorts: 'Cluster Worker or Cluster Manager service: ' +
    '{{clusterPorts}}',
  addHostInfoCouchbasePorts: 'Couchbase: {{couchbasePorts}}',
  addInfoStep3: 'Insert the IP address or hostname of the node to add in the ' +
    'above field, or visit the onepanel web interface of the node and press ' +
    '"Join cluster" to easily obtain node hostname.',
  addInfoStep4: 'If the new node is reachable and the ports are open, it will ' +
    'be discovered and added to the cluster.',
};
