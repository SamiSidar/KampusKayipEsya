import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';

export function ForgotPasswordScreen() {
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
            A7/OBS kullanıcı hesabınıza bağlı e-posta adresinizi girin. Parola
            sıfırlama yönergeleri sistem üzerinden gönderilecektir.
          </Text>

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
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Sıfırlama Bağlantısı Gönder</Text>
          </Pressable>

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.yeditepeBlue}
              style={styles.infoIcon}
            />

            <Text style={styles.infoText}>
              Parola işlemleri Yeditepe Üniversitesi kimlik doğrulama sistemi
              üzerinden yürütülür.
            </Text>
          </View>
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
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
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

  primaryButtonText: {
    color: colors.white,
    fontSize: 14.5,
    fontWeight: '800',
  },

  infoBox: {
    width: '100%',
    backgroundColor: '#F2F3FB',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 211, 0.55)',
  },

  infoIcon: {
    marginRight: 9,
    marginTop: 1,
  },

  infoText: {
    flex: 1,
    fontSize: 12.4,
    lineHeight: 18,
    color: colors.textPrimary,
  },
});