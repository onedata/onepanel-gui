export default {
  emergencyInterface: 'Emergency interface',
  oneproviderUnavailable: 'Oneprovider service malfunction',
  onezoneUnavailable: 'Onezone service malfunction',
  modal: {
    close: 'Close',
    emergency: {
      header: 'Emergency interface',
      text1: 'You are currently in the emergency Onepanel interface. It is limited to this cluster only and most of its features are disabled. You can only sign in using your Onepanel emergency passphrase. The interface is available on port 9443 and should be used for emergency situations, typically when the Onezone interface is not available.',
      text2: 'The recommended way of managing your cluster is via the Onezone interface. This interface integrates all features offered by Onedata – your cluster can be found in the Clusters menu. To access it, click the button below and sign in with your Onedata user account.',
      openInOnezone: 'Open in Onezone',
    },
    workerMalfunction: {
      ozMainMessage: 'The Onezone service is not running correctly. Onepanel will regularly try to restart the service, but in case the problem persists, it might require your attention:',
      ozConsultLogs: 'Consult the oz-panel and oz-worker logs for indication of any problems.',
      ozVerifyRunning: 'Verify that the oz-worker service is running on all designated hosts, if not try to restart it manually (<code>service oz_worker restart</code>) and examine the logs.',
      opMainMessage: 'The Oneprovider service is not functioning correctly. Typical causes are:',
      opSuperiorOnezoneBeforeUrl: 'The superior Onezone service (',
      opSuperiorOnezoneAfterUrl: ') is not reachable - in such case, the Oneprovider service works to a very limited extent and awaits connectivity. During that time, the Onepanel interface displays only partial information.',
      opIsNotRunning: 'The Oneprovider service is not running correctly. Onepanel will regularly try to restart the service, but in case the problem persists, it might require your attention:',
      opConsultLogs: 'Consult the op-panel and op-worker logs for indication of any problems.',
      opVerifyRunning: 'Verify that the op-worker service is running on all designated hosts, if not try to restart it manually (<code>service op_worker restart</code>) and examine the logs.',
    },
  },
};
