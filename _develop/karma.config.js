module.exports = function(config) {
  config.set({
    basePath: '../',
    urlRoot: '/karma/',

    files: [
      { pattern: '../assets/favicon.png', included: false, served: true }
    ],

    frameworks: ['jasmine'],
    reporters: ['progress'],
    colors: true,
    autoWatch: false,
    singleRun: true,
    browsers: ['Chrome'],

    client: {
      useIframe: false
    },

    coverageReporter: {
      dir: '.coverage',
      reporters: [
        { type: 'text' },
        { type: 'html' }
      ]
    }
  });
};