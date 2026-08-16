import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { initCrashReporting, setupGlobalHandlers } from './src/services/crashReporting';

// Crash reporting başlat
initCrashReporting();
setupGlobalHandlers();

// Dinamik metin boyutunu sınırla — layout bozulmalarını önler
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.maxFontSizeMultiplier = 1.3;

if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.maxFontSizeMultiplier = 1.3;

export default function App() {
  return (
    <ErrorBoundary>
      <NetworkProvider>
        <AuthProvider>
          <View style={styles.container}>
            <RootNavigator />
          </View>
        </AuthProvider>
      </NetworkProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.yeditepeBlue,
  },
});
