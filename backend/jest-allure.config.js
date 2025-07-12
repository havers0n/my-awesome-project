module.exports = {
  ...require('./jest.config.js'),
  reporters: [
    'default',
    [
      'jest-allure',
      {
        outputDir: 'allure-results',
        reportOpenAfterTests: false,
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
      }
    ]
  ],
  testRunner: 'jest-circus/runner'
};
