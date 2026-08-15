import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

// ============================================================
// RegisterScreen — Öğrenci kayıt ekranı.
//
// Ne yapar:
// - Ad, soyad, email, şifre, öğrenci numarası alır
// - Email domain kontrolü yapar (@std.yeditepe.edu.tr veya @yeditepe.edu.tr)
// - Backend'e register isteği gönderir
// - Başarılıysa otomatik giriş yapar ve Splash'e yönlendirir
//
// Kullandığı servisler:
// - useAuth() → register fonksiyonu (AuthContext'ten)
// ============================================================

type RegisterNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ALLOWED_DOMAINS = ['@std.yeditepe.edu.tr', '@yeditepe.edu.tr'];

export function RegisterScreen() {
  const navigation = useNavigation<RegisterNavigationProp>();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function validateForm(): string | null {
    if (!firstName.trim()) return 'Ad giriniz';
    if (!lastName.trim()) return 'Soyad giriniz';
    if (!email.trim()) return 'Email adresi giriniz';

    const emailLower = email.trim().toLowerCase();
    const validDomain = ALLOWED_DOMAINS.some((d) => emailLower.endsWith(d));
    if (!validDomain) {
      return 'Sadece @std.yeditepe.edu.tr veya @yeditepe.edu.tr uzantılı email adresleri kabul edilir';
    }

    if (!password.trim()) return 'Şifre giriniz';
    if (password.length < 6) return 'Şifre en az 6 karakter olmalıdır';
    if (password !== confirmPassword) return 'Şifreler eşleşmiyor';
    if (!studentNumber.trim()) return 'Öğrenci numarası giriniz';

    return null;
  }

  async function handleRegister() {
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        studentNumber: studentNumber.trim(),
      });

      navigation.replace('Splash');
    } catch (error: any) {
      setErrorMessage(error.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.headerSide} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Kayıt Ol</Text>
        <View style={styles.headerSide} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>HESAP OLUŞTUR</Text>
            <Text style={styles.helperText}>
              Yeditepe Üniversitesi email adresiniz ile kayıt olun
            </Text>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Ad */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ad</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={21} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Adınız"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Soyad */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Soyad</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={21} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Soyadınız"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={21} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="ornek@std.yeditepe.edu.tr"
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

            {/* Öğrenci Numarası */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Öğrenci Numarası</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card-outline" size={21} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Öğrenci numaranız"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  value={studentNumber}
                  onChangeText={setStudentNumber}
                  keyboardType="number-pad"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Şifre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={21} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="En az 6 karakter"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Şifre Tekrar */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre Tekrar</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={21} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Şifrenizi tekrar girin"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isLoading}
                  onSubmitEditing={handleRegister}
                />
              </View>
            </View>

            {/* Kayıt Ol butonu */}
            <Pressable
              style={[styles.registerButton, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={19} color={colors.white} />
                  <Text style={styles.registerButtonText}>Kayıt Ol</Text>
                </>
              )}
            </Pressable>

            {/* Giriş yap linki */}
            <Pressable style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}>
                Zaten hesabınız var mı? <Text style={styles.loginLinkBold}>Giriş Yap</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  card: {
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
    marginBottom: 14,
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
  registerButton: {
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
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: colors.white,
    fontSize: 15.5,
    fontWeight: '800',
  },
  loginLink: {
    marginTop: 18,
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
