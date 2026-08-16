const { withInfoPlist } = require('expo/config-plugins');

/**
 * Expo Config Plugin: iOS App Transport Security
 * - Tüm HTTP bağlantılarını engeller (ATS)
 * - Localhost geliştirme için istisna tanımlar
 */
const withATSSecurity = (config) => {
  return withInfoPlist(config, (config) => {
    config.modResults.NSAppTransportSecurity = {
      NSAllowsArbitraryLoads: false,
      NSExceptionDomains: {
        localhost: {
          NSExceptionAllowsInsecureHTTPLoads: true,
          NSIncludesSubdomains: false,
        },
      },
    };
    return config;
  });
};

module.exports = withATSSecurity;
