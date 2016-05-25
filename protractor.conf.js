exports.config = { // jshint ignore:line

  // The version is susceptible to change
  seleniumServerJar: './node_modules/gulp-protractor/node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
  // chromeDriver: './node_modules/gulp-protractor/node_modules/protractor/selenium/chromedriver',

  baseUrl: 'http://localhost:9000',
  //baseUrl: 'http://10.1.10.26:9000',

  capabilities: {
    browserName: 'chrome'
    // chromeOptions: {
    //    binary: '/usr/bin/google-chrome-stable'
    // }
  },

  framework: 'jasmine',

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }

};
