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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

// ============================================================
// PersonalInfoScreen — Kişisel bilgileri görüntüleme ve düzenleme.
//
// - Profil bilgileri (ad, telefon, bölüm) düzenlenebilir
// - Şifre değiştirme bölümü
// ============================================================

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function PersonalInfoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, token, refreshAccessToken } = useAuth();

  // Profil düzenleme
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // Şifre değiştirme
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const hasProfileChanges =
    fullName !== (user?.fullName ?? '') ||
    phoneNumber !== (user?.phoneNumber ?? '') ||
    department !== (user?.department ?? '');

  async function handleSaveProfile() {
    if (!fullName.trim()) {
      setProfileError('Ad soyad boş olamaz');
      return;
    }

    setProfileError('');
    setProfileMessage('');
    setIsProfileLoading(true);

    try {
      await authService.updateProfile(token!, {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        department: department.trim(),
      });
      // Refresh user data
      await refreshAccessToken();
      setProfileMessage('Profil güncellendi.');
    } catch (error: any) {
      setProfileError(error.message || 'Profil güncellenemedi.');
    } finally {
      setIsProfileLoading(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword) {
      setPasswordError('Mevcut şifrenizi girin');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('Yeni şifre mevcut şifreyle aynı olamaz');
      return;
    }

    setPasswordError('');
    setPasswordMessage('');
    setIsPasswordLoading(true);

    try {
      await authService.changePassword(token!, currentPassword, newPassword);
      setPasswordMessage('Şifre başarıyla değiştirildi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      setPasswordError(error.message || 'Şifre değiştirilemedi.');
    } finally {
      setIsPasswordLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable accessibilityRole="button" style={styles.headerSide} onPress={() => navigation.goBack()} accessibilityLabel="Geri dön">
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Kişisel Bilgiler</Text>
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
          {/* ═══════ PROFİL BİLGİLERİ ═══════ */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color={colors.yeditepeBlue} />
              <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
            </View>

            {profileError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{profileError}</Text>
              </View>
            ) : null}

            {profileMessage ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.successText}>{profileMessage}</Text>
              </View>
            ) : null}

            {/* Email — readonly */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <Text style={styles.readonlyText}>{user?.email ?? ''}</Text>
                <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
              </View>
            </View>

            {/* Öğrenci No — readonly */}
            {user?.studentNumber ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Öğrenci Numarası</Text>
                <View style={[styles.inputWrapper, styles.inputDisabled]}>
                  <Ionicons name="card-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <Text style={styles.readonlyText}>{user.studentNumber}</Text>
                  <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
                </View>
              </View>
            ) : null}

            {/* Ad Soyad */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ad Soyad</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={(t) => { setFullName(t); setProfileMessage(''); }}
                  placeholder="Ad Soyad"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="words"
                  editable={!isProfileLoading}
                />
              </View>
            </View>

            {/* Telefon */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon Numarası</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={(t) => { setPhoneNumber(t); setProfileMessage(''); }}
                  placeholder="05XX XXX XX XX"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  editable={!isProfileLoading}
                />
              </View>
            </View>

            {/* Bölüm */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bölüm</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="school-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={department}
                  onChangeText={(t) => { setDepartment(t); setProfileMessage(''); }}
                  placeholder="Bölümünüz"
                  placeholderTextColor={colors.textSecondary}
                  editable={!isProfileLoading}
                />
              </View>
            </View>

            {/* Kaydet */}
            <Pressable accessibilityRole="button"
              style={[
                styles.saveButton,
                (!hasProfileChanges || isProfileLoading) && styles.buttonDisabled,
              ]}
              onPress={handleSaveProfile}
              disabled={!hasProfileChanges || isProfileLoading}
              accessibilityState={{ disabled: !hasProfileChanges || isProfileLoading }}
              accessibilityLabel="Değişiklikleri kaydet"
            >
              {isProfileLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={19} color={colors.white} />
                  <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* ═══════ ŞİFRE DEĞİŞTİR ═══════ */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.yeditepeBlue} />
              <Text style={styles.sectionTitle}>Şifre Değiştir</Text>
            </View>

            {passwordError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{passwordError}</Text>
              </View>
            ) : null}

            {passwordMessage ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.successText}>{passwordMessage}</Text>
              </View>
            ) : null}

            {/* Mevcut Şifre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mevcut Şifre</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={(t) => { setCurrentPassword(t); setPasswordMessage(''); }}
                  placeholder="Mevcut şifreniz"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  editable={!isPasswordLoading}
                />
              </View>
            </View>

            {/* Yeni Şifre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Yeni Şifre</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={(t) => { setNewPassword(t); setPasswordMessage(''); }}
                  placeholder="En az 6 karakter"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  editable={!isPasswordLoading}
                />
              </View>
            </View>

            {/* Yeni Şifre Tekrar */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Yeni Şifre Tekrar</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={confirmNewPassword}
                  onChangeText={(t) => { setConfirmNewPassword(t); setPasswordMessage(''); }}
                  placeholder="Yeni şifrenizi tekrar girin"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  editable={!isPasswordLoading}
                  onSubmitEditing={handleChangePassword}
                />
              </View>
            </View>

            {/* Şifre Değiştir */}
            <Pressable accessibilityRole="button"
              style={[styles.changePasswordButton, isPasswordLoading && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={isPasswordLoading}
              accessibilityLabel="Şifre değiştir"
              accessibilityState={{ disabled: isPasswordLoading }}
            >
              {isPasswordLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={19} color={colors.white} />
                  <Text style={styles.saveButtonText}>Şifre Değiştir</Text>
                </>
              )}
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
    paddingTop: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.yeditepeBlue,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
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
    marginBottom: 14,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 13,
    color: colors.success,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 7,
  },
  inputWrapper: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.borderLight85,
    borderRadius: 14,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  inputIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: 'transparent',
    outlineStyle: 'none' as any,
  },
  readonlyText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  changePasswordButton: {
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    shadowColor: colors.success,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
