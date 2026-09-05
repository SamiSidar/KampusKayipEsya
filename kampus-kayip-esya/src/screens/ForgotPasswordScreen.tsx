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
import { AppHeader } from '../components/AppHeader';
import { RootStackParamList } from '../navigation/types';
import { authService } from '../services/authService';

// ============================================================
// ForgotPasswordScreen — Şifre sıfırlama isteği.
//
// Ne yapar:
// - Yeditepe uzantılı e-posta adresi alır
// - Backend'e sıfırlama bağlantısı gönderme isteği atar
//
// Kullandığı servis: authService.forgotPassword()
// ============================================================

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit() {
    if (!email.trim()) {
      setErrorMessage('Email adresi giriniz');
      return;
    }

    const emailLower = email.trim().toLowerCase();
    if (!emailLower.endsWith('@std.yeditepe.edu.tr') && !emailLower.endsWith('@yeditepe.edu.tr')) {
      setErrorMessage('Sadece @std.yeditepe.edu.tr veya @yeditepe.edu.tr uzantılı adresler kabul edilir');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(emailLower);
      setSuccessMessage('Şifre sıfırlama bağlantısı email adresinize gönderildi.');
      setEmail('');
    } catch (error: any) {
      setErrorMessage(error.message || 'İşlem başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Parolamı Unuttum" showBack showNotification={false} />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="lock-closed-outline"
              size={42}
              color={colors.yeditepeBlue}
            />
          </View>

          <Text style={styles.title}>Parola Sıfırlama</Text>

          <Text style={styles.description}>
            Kayıtlı e-posta adresinizi girin. Şifre sıfırlama bağlantısı
            gönderilecektir.
          </Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta Adresi</Text>

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
                onChangeText={(t) => { setEmail(t); setErrorMessage(''); setSuccessMessage(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                onSubmitEditing={handleSubmit}
              />
            </View>
          </View>

          <Pressable
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            accessibilityState={{ disabled: isLoading }}
            accessibilityLabel="Sıfırlama bağlantısı gönder"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Sıfırlama Bağlantısı Gönder</Text>
            )}
          </Pressable>

          <Pressable style={styles.loginLink} onPress={() => navigation.navigate('Login')} accessibilityLabel="Giriş yap sayfasına git">
            <Text style={styles.loginLinkText}>
              Şifrenizi hatırlıyor musunuz? <Text style={styles.loginLinkBold}>Giriş Yap</Text>
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

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 6,
  },

  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.blueTint10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  title: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.yeditepeBlue,
    textAlign: 'center',
    marginBottom: 10,
  },

  description: {
    fontSize: 13.2,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },

  errorBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
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

  successBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },

  successText: {
    flex: 1,
    fontSize: 13,
    color: colors.success,
  },

  inputGroup: {
    width: '100%',
    marginBottom: 18,
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
    borderColor: colors.borderLight85,
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
    outlineStyle: 'none' as any,
  },

  primaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
    marginBottom: 16,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 14.5,
    fontWeight: '800',
  },

  loginLink: {
    marginTop: 4,
    alignItems: 'center',
  },

  loginLinkText: {
    fontSize: 13.5,
    color: colors.textSecondary,
  },

  loginLinkBold: {
    color: colors.yeditepeBlue,
    fontWeight: '800',
  },
});
