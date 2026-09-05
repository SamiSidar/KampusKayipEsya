import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { DialogProvider } from './src/components/AppDialog';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { initCrashReporting, setupGlobalHandlers } from './src/services/crashReporting';

// ============================================================
// App.tsx — Uygulamanın giriş noktası.
//
// Sağlayıcı (provider) sırası önemlidir, dıştan içe:
// - ErrorBoundary   : beklenmedik bir hata olursa beyaz ekran yerine mesaj gösterir
// - NetworkProvider : internet bağlantısını izler
// - AuthProvider    : giriş bilgisi ve token'ı tüm ekranlara dağıtır
// - DialogProvider  : uygulama içi uyarı/onay pencerelerini yönetir
// - RootNavigator   : ekranlar arası geçişi yapar
//
// Ayrıca cihazın yazı boyutu ayarı 1.3 katla sınırlanır; aksi halde çok
// büyük yazı tipinde ekran düzeni bozuluyor.
// ============================================================

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
          <DialogProvider>
            <View style={styles.container}>
              <RootNavigator />
            </View>
          </DialogProvider>
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
