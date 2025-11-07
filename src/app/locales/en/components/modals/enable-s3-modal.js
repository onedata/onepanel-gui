const generateIntro = (s = '') =>
  `You are about to enable the S3 data access protocol on the following host${s}:`;

export default {
  title: 'Enable S3 data access protocol',
  body: {
    intro: {
      singular: generateIntro(),
      plural: generateIntro('s'),
    },
    oneS3Deployment: 'Each OneS3 service will listen on port <strong>{{port}}</strong>.',
    deploying: '<strong>Deploying a OneS3 service on the selected hosts:</strong> {{step}}...',
  },
  buttons: {
    deploy: 'Deploy',
    cancel: 'Cancel',
  },
  startingDeployment: 'starting OneS3 deployment',
  unknownStep: 'initializing',
  noTaskId: 'Deployment has been started, but the task progress is not available. Refresh the page for updates.',
  steps: {
    // using S3DeploymentStep enum keys, because values contain `:`
    OneS3CreateService: 'creating OneS3 service',
    OneS3AddServiceHost: 'adding OneS3 service host',
    OneproviderSetClusterIps: 'setting Oneprovider cluster IPs',
    OnepanelSetMarker: 'setting the marker',
    OneS3Configure: 'configuring OneS3',
    OneproviderStart: 'starting OneS3',
    OneproviderWaitForInit: 'waiting for OneS3 initialization',
    LetsEncryptDisable: 'disabling Let\'s Encrypt service (if exists)',
  },
};
