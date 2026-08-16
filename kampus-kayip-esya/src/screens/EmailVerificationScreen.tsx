import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { authService } from '../services/authService';

// ============================================================
// EmailVerificationScreen — Email doğrulama ekranı.
//
// Kayıt sonrası açılır. 6 haneli doğrulama kodunu girer.
// Doğrulama başarılıysa Login ekranına yönlendirir.
// ============================================================

type VerificationNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type VerificationRouteProp = RouteProp<RootStackParamList, 'EmailVerification'>;

const CODE_LENGTH = 6;

export function EmailVerificationScreen() {
  const navigation = useNavigation<VerificationNavigationProp>();
  const route = useRoute<VerificationRouteProp>();
  const email = route.params.email;

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleCodeChange = useCallback((text: string, index: number) => {
    // Sadece rakam kabul et
    const digit = text.replace(/[^0-9]/g, '');

    setCode((prev) => {
      const newCode = [...prev];

      if (digit.length > 1) {
        // Paste edilmiş olabilir — tüm haneleri dağıt
        const digits = digit.slice(0, CODE_LENGTH - index).split('');
        digits.forEach((d, i) => {
          if (index + i < CODE_LENGTH) {
            newCode[index + i] = d;
          }
        });
        const nextIndex = Math.min(index + digits.length, CODE_LENGTH - 1);
        setTimeout(() => inputRefs.current[nextIndex]?.focus(), 0);
      } else {
        newCode[index] = digit;
        if (digit && index < CODE_LENGTH - 1) {
          setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
        }
      }

      return newCode;
    });

    setErrorMessage('');
  }, []);

  const handleKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      setCode((prev) => {
        if (!prev[index] && index > 0) {
          setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
          const newCode = [...prev];
          newCode[index - 1] = '';
          return newCode;
        }
        const newCode = [...prev];
        newCode[index] = '';
        return newCode;
      });
    }
  }, []);

  async function handleVerify() {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) {
      setErrorMessage('Lütfen 6 haneli doğrulama kodunu girin');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await authService.verifyEmail(email, fullCode);
      setSuccessMessage('Email doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => {
        navigation.replace('Login');
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error.message || 'Doğrulama başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await authService.resendVerification(email);
      setSuccessMessage('Yeni doğrulama kodu gönderildi.');
      setResendCooldown(60);
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      setErrorMessage(error.message || 'Kod gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" style={styles.headerSide} onPress={() => navigation.goBack()} accessibilityLabel="Geri dön">
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Email Doğrulama</Text>
        <View style={styles.headerSide} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.card}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="mail-open-outline" size={52} color={colors.yeditepeBlue} />
            </View>

            <Text style={styles.cardTitle}>EMAIL DOĞRULAMA</Text>
            <Text style={styles.helperText}>
              <Text style={styles.emailText}>{email}</Text> adresine gönderilen{'\n'}
              6 haneli doğrulama kodunu girin.
            </Text>

            {/* Error */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Success */}
            {successMessage ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            {/* Code inputs */}
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.codeInput,
                    digit ? styles.codeInputFilled : null,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? CODE_LENGTH : 1}
                  autoFocus={index === 0}
                  editable={!isLoading}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Verify button */}
            <Pressable accessibilityRole="button"
              style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={isLoading}
              accessibilityState={{ disabled: isLoading }}
              accessibilityLabel="Doğrula"
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={19} color={colors.white} />
                  <Text style={styles.verifyButtonText}>Doğrula</Text>
                </>
              )}
            </Pressable>

            {/* Resend */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendLabel}>Kod gelmedi mi?</Text>
              <Pressable accessibilityRole="button" onPress={handleResend} disabled={resendCooldown > 0 || isResending} accessibilityLabel="Kodu tekrar gönder">
              accessibilityState={{ disabled: resendCooldown > 0 || isResending }}
                {isResending ? (
                  <ActivityIndicator color={colors.yeditepeBlue} size="small" />
                ) : (
                  <Text
                    style={[
                      styles.resendButton,
                      resendCooldown > 0 && styles.resendDisabled,
                    ]}
                  >
                    {resendCooldown > 0
                      ? `Tekrar gönder (${resendCooldown}s)`
                      : 'Tekrar Gönder'}
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Login link */}
            <Pressable accessibilityRole="button" style={styles.loginLink} onPress={() => navigation.navigate('Login')} accessibilityLabel="Giriş yap sayfasına git">
              <Text style={styles.loginLinkText}>
                Zaten doğruladınız mı? <Text style={styles.loginLinkBold}>Giriş Yap</Text>
              </Text>
            </Pressable>
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 30,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emailText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  errorBox: {
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  codeInput: {
    width: 46,
    height: 56,
    borderWidth: 2,
    borderColor: colors.borderLight85,
    borderRadius: 14,
    backgroundColor: colors.white,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  codeInputFilled: {
    borderColor: colors.yeditepeBlue,
  },
  verifyButton: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: 15.5,
    fontWeight: '800',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  resendLabel: {
    fontSize: 13.5,
    color: colors.textSecondary,
  },
  resendButton: {
    fontSize: 13.5,
    color: colors.yeditepeBlue,
    fontWeight: '800',
  },
  resendDisabled: {
    color: colors.textSecondary,
    fontWeight: '400',
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
