const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const path = require('path');

/**
 * Expo Config Plugin: Android Network Security Configuration
 * - Production'da cleartext (HTTP) trafiği engeller
 * - Certificate pinning için pin set tanımlar
 *
 * Pin değerleri production sertifikası alındığında güncellenmelidir.
 */
const withNetworkSecurity = (config, { pins = [] } = {}) => {
  return withAndroidManifest(config, async (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );

    mainApplication.$['android:networkSecurityConfig'] =
      '@xml/network_security_config';

    // Generate network_security_config.xml
    const resXmlDir = path.join(
      config.modRequest.platformProjectRoot,
      'app/src/main/res/xml'
    );

    if (!existsSync(resXmlDir)) {
      mkdirSync(resXmlDir, { recursive: true });
    }

    const pinEntries = pins.length > 0
      ? `<pin-set expiration="2027-01-01">
${pins.map(p => `            <pin digest="SHA-256">${p}</pin>`).join('\n')}
        </pin-set>`
      : '<!-- Pin değerleri production sertifikası alındığında eklenecek -->';

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">yeditepe.edu.tr</domain>
        ${pinEntries}
    </domain-config>
    <!-- Geliştirme ortamı için localhost izni -->
    <domain-config cleartextTrafficPermitted="true">
        <domain>10.0.2.2</domain>
        <domain>localhost</domain>
    </domain-config>
</network-security-config>`;

    writeFileSync(path.join(resXmlDir, 'network_security_config.xml'), xml);

    return config;
  });
};

module.exports = withNetworkSecurity;
