export default {
  headers: {
    first: 'New Onepanel installation',
    create: 'Create an admin account',
    join: 'Join a cluster',
  },
  hints: {
    first: 'Onepanel is used to create a deployment on a cluster of nodes. Please ensure it is preinstalled on all nodes destined to be a part of the cluster. Having done that, simply choose "Create a new cluster" on one of the nodes, "Join a cluster" on the others, and follow the wizard. When deploying a single-node installation, just press "Create a new cluster".',
  },
  descriptions: {
    join: 'When setting up a new cluster on another node, choose the "add host" action and paste in this node\'s hostname:',
  },
  createNewCluster: 'Create a new cluster',
  createNewClusterHint: 'Create a new cluster. You will be prompted to create an admin account, which will later be used to manage your cluster. Follow the wizard to add other nodes and set up your cluster.',
  joinCluster: 'Join a cluster',
  joinClusterHint: 'Add this node to an existing cluster. Follow the instructions on the next screen.',
  back: 'Back',
  registerSuccess: 'Admin user registered successfully',
  copy: 'Copy',
};
