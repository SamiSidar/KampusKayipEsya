import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

// ============================================================
// LoginScreen — Giriş ekranı.
//
// Ne yapar:
// - Email ve şifre alır
// - Backend'e login isteği gönderir
// - Başarılıysa role'e göre doğru ekrana yönlendirir:
//   STUDENT → StudentHome, ADMIN/SECURITY → AdminPanel
// - Hata olursa kullanıcıya mesaj gösterir
//
// Kullandığı servisler:
// - useAuth() → login fonksiyonu (AuthContext'ten)
// ============================================================

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const { login } = useAuth();

  // Form state'leri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Giriş butonuna basıldığında çalışır.
   * Email ve şifre boş mu kontrol eder, sonra API'ye istek atar.
   */
  async function handleLogin() {
    // Basit validasyon
    if (!email.trim()) {
      setErrorMessage('Email adresi giriniz');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Şifre giriniz');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await login({ email: email.trim(), password });

      // Login başarılı — AuthContext'teki user bilgisinden role'ü alalım.
      // login() içinde user zaten set ediliyor, ama burada henüz
      // güncellenmemiş olabilir. Bu yüzden authService'ten dönen
      // response'u kontrol ediyoruz.
      //
      // Basit çözüm: login sonrası useAuth'taki user'ı okumak için
      // navigation'ı bir sonraki renderda yapalım.
      // Ama daha temiz çözüm: login fonksiyonundan user'ı döndürmek.
      //
      // Şimdilik role kontrolünü SplashScreen'e bırakıyoruz:
      // Login başarılı olunca Splash'e gidip oradan yönlendirme yapılacak.
      navigation.replace('Splash');
    } catch (error: any) {
      setErrorMessage(error.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>Giriş</Text>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.content}>
        <View style={styles.loginCard}>
          <Text style={styles.cardTitle}>OTURUM AÇIN</Text>

          <Text style={styles.helperText}>
            Kayıtlı email adresiniz ve şifreniz ile giriş yapınız
          </Text>

          {/* Hata mesajı */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email alanı */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={21}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="ornek@yeditepe.edu.tr"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Şifre alanı */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parola</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={21}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Parolanızı girin"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                onSubmitEditing={handleLogin}
              />
            </View>
          </View>

          {/* Giriş butonu */}
          <Pressable
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={19} color={colors.white} />
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              </>
            )}
          </Pressable>

          {/* Kayıt ol linki */}
          <Pressable style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLinkText}>
              Hesabınız yok mu? <Text style={styles.registerLinkBold}>Kayıt Ol</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 72,
    backgroundColor: colors.yeditepeBlue,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },

  headerSide: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
    justifyContent: 'flex-start',
  },

  loginCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 26,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.yeditepeBlue,
    textAlign: 'center',
    marginBottom: 8,
  },

  helperText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
  },

  inputGroup: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  inputWrapper: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 211, 0.85)',
    borderRadius: 16,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  inputIcon: {
    marginRight: 9,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    outlineStyle: 'none' as any,
  },

  loginButton: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: colors.white,
    fontSize: 15.5,
    fontWeight: '800',
  },

  registerLink: {
    marginTop: 18,
    alignItems: 'center' as const,
  },

  registerLinkText: {
    fontSize: 13.5,
    color: colors.textSecondary,
  },

  registerLinkBold: {
    color: colors.yeditepeBlue,
    fontWeight: '800' as const,
  },
});
