export default {
  port: 'Port',
  tip: {
    intro: 'Port number for the OneS3 service on the host.',
    setOnlyOnce: 'Note, that the port can be set only once, when the OneS3 is added to the cluster for the first time. Additional OneS3 services added later will use the same port.',
    autoColliding: '<strong>It has been automatically set to the recommended value, which does not conflict with the Cluster Worker port</strong>, but you can customize it.',
    setToRecommended: 'It has been automatically set to the recommended value, but you can customize it.',
    isInvalid: '<strong>The current value is invalid: {{reason}}.</strong>',
  },
};
