export default {
  headers: {
    first: 'New Onepanel installation',
    create: 'Set Onepanel emergency passphrase',
    join: 'Join a cluster',
  },
  createHint: 'Emergency passphrase is used to gain administrative access to the Onepanel emergency interface, allowing to view, modify and remove the cluster installation. It is not associated with any user in the system. The emergency passphrase is especially useful for maintenance when the superior Onezone service is down and its not possible to log in with your Onedata user account.',
  descriptions: {
    first: 'Onepanel is used to create a deployment on a cluster of nodes.',
    firstMore: 'Please ensure it is preinstalled on all nodes destined to be a ' +
      'part of the cluster. Having done that, simply choose ' +
      '"Create a new cluster" on one of the nodes, "Join a cluster" on ' +
      'the others, and follow the wizard. When deploying a single-node ' +
      'installation, just press "Create a new cluster".',
    join: 'When setting up a new cluster on another node, choose the "add host" ' +
      'action and paste in this node\'s hostname:',
  },
  showMoreLink: 'Show more information...',
  createNewCluster: 'Create a new cluster',
  joinCluster: 'Join a cluster',
  back: 'Back',
  settingPassphraseSuccess: 'Emergency passphrase set successfully',
  copy: 'Copy',
};
