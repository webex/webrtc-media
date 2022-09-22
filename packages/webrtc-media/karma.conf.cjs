const karmaGlobalConfig = require('../../config/karma.global.cjs');

module.exports = (config) => {
  let karmaConfig = {
    ...karmaGlobalConfig(config)
  }
  config.set(karmaConfig);
};
