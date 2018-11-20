export default {
  lowerFileSizeLimit: 'Lower size limit',
  upperFileSizeLimit: 'Upper size limit',
  minHoursSinceLastOpen: 'Not opened for',
  maxOpenCount: 'Opened up till now',
  maxHourlyMovingAverage: 'Opened per hour',
  maxDailyMovingAverage: 'Opened per day',
  maxMonthlyMovingAverage: 'Opened per month',
  conditionsHintEnabledBegin: 'When enabled, evicts only redundant replicas that satisfies',
  conditionsHintEnabledStrong: 'all conditions',
  conditionsHintEnabledEnd: 'specified below.',
  conditionsHintDisabled: 'When disabled, evicts redundant replicas arbitrarily.',
  hint: {
    lowerFileSizeLimit: 'Only files which size [b] is greater than given value may be cleaned.',
    upperFileSizeLimit: 'Only files which size [b] is less than given value may be cleaned.',
    minHoursSinceLastOpen: 'Files that haven\'t been opened for longer than or equal to given period [h] may be cleaned.',
    maxOpenCount: 'File that have been opened less times will be cleaned.',
    maxHourlyMovingAverage: 'Files that have moving average of open operations count per hour less than given value may be cleaned. The average is calculated in 24 hours window.',
    maxDailyMovingAverage: 'Files that have moving average of open operations count per day less than given value may be cleaned. The average is calculated in 31 days window.',
    maxMonthlyMovingAverage: 'Files that have moving average of open operations count per month less than given value may be cleaned. The average is calculated in 12 months window.',
  },
  timeUnits: {
    seconds: 'Seconds',
    minutes: 'Minutes',
    hours: 'Hours',
    days: 'Days',
  },
  modified: 'Not saved yet...',
  saving: 'Saving...',
  saved: 'Saved!',
  updateFailed: 'Update failed!',
  times: 'times',
  togglingSelectiveCleaning: 'toggling selective cleaning',
};
