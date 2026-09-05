import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { StudentBottomBar } from '../components/StudentBottomBar';
import { InlineError } from '../components/InlineError';
import { useDialog } from '../components/AppDialog';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { getUserRoleLabel } from '../types/user';

// ============================================================
// StudentProfileScreen — Öğrenci profil ekranı.
//
// Ne yapar:
// - Kullanıcı adını ve rolünü gösterir
// - Menü: Kişisel Bilgiler / Bildirim Ayarları / Yardım / Çıkış Yap
// - Çıkış işlemi önce uygulama içi onay penceresi açar
//
// Kullandığı servis: useAuth() → logout
// ============================================================

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type MenuItem = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger: boolean;
  action: 'personalInfo' | 'notifications' | 'help' | 'logout';
};

const menuItems: MenuItem[] = [
  {
    id: '1',
    title: 'Kişisel Bilgiler',
    icon: 'person-outline',
    danger: false,
    action: 'personalInfo',
  },
  {
    id: '2',
    title: 'Bildirim Ayarları',
    icon: 'notifications-outline',
    danger: false,
    action: 'notifications',
  },
  {
    id: '3',
    title: 'Yardım',
    icon: 'help-circle-outline',
    danger: false,
    action: 'help',
  },
  {
    id: '4',
    title: 'Çıkış Yap',
    icon: 'log-out-outline',
    danger: true,
    action: 'logout',
  },
];

export function StudentProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();
  const { alert, confirm } = useDialog();
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogout() {
    try {
      setLoggingOut(true);
      setErrorMessage('');
      await logout();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch {
      setLoggingOut(false);
      setErrorMessage('Çıkış yapılırken bir hata oluştu. Tekrar deneyin.');
    }
  }

  async function confirmLogout() {
    const approved = await confirm({
      title: 'Çıkış Yap',
      message: 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      tone: 'danger',
      confirmText: 'Çıkış Yap',
      cancelText: 'Vazgeç',
    });

    if (approved) handleLogout();
  }

  async function handleMenuPress(action: MenuItem['action']) {
    switch (action) {
      case 'personalInfo':
        navigation.navigate('PersonalInfo');
        break;
      case 'notifications':
        await alert({
          title: 'Bildirim Ayarları',
          message: 'Bildirim ayarları yakında eklenecektir.',
          tone: 'info',
        });
        break;
      case 'help':
        await alert({
          title: 'Yardım',
          message:
            'Kampüs Kayıp Eşya Uygulaması\nYeditepe Üniversitesi\n\nSorun veya önerileriniz için:\nkampuskayipesya@yeditepe.edu.tr',
          tone: 'info',
        });
        break;
      case 'logout':
        await confirmLogout();
        break;
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>

          <View style={styles.profileBlock}>
            <View style={styles.avatarWrapper}>
              <Ionicons
                name="person-outline"
                size={48}
                color={colors.yeditepeBlue}
              />
            </View>

            <Text style={styles.name}>{user?.fullName ?? ''}</Text>
            <Text style={styles.role}>
              {user ? getUserRoleLabel(user.role) : ''}
            </Text>
          </View>
        </View>

        <View style={styles.errorWrap}>
          <InlineError message={errorMessage} />
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => {
            const isLast = index === menuItems.length - 1;

            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.menuItem,
                  !isLast && styles.menuDivider,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => handleMenuPress(item.action)}
                accessibilityLabel={item.title}
                disabled={loggingOut && item.action === 'logout'}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    item.danger && styles.menuIconCircleDanger,
                  ]}
                >
                  {loggingOut && item.action === 'logout' ? (
                    <ActivityIndicator size="small" color={colors.error} />
                  ) : (
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={item.danger ? colors.error : colors.textSecondary}
                    />
                  )}
                </View>

                <Text
                  style={[
                    styles.menuText,
                    item.danger && styles.dangerText,
                  ]}
                >
                  {item.title}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={21}
                  color={
                    item.danger
                      ? colors.errorTint50
                      : colors.textSecondary
                  }
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <StudentBottomBar activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingBottom: 130,
  },

  header: {
    backgroundColor: colors.yeditepeBlue,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 46,
    paddingBottom: 54,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 22,
  },

  profileBlock: {
    alignItems: 'center',
  },

  avatarWrapper: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.black,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  name: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },

  role: {
    color: colors.whiteAlpha86,
    fontSize: 14,
    fontWeight: '700',
  },

  errorWrap: {
    marginHorizontal: 16,
    marginTop: 16,
  },

  menuCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  menuItem: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemPressed: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.85,
  },

  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight45,
  },

  menuIconCircle: {
    width: 42,
    minHeight: 44,
    borderRadius: 21,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  menuIconCircleDanger: {
    backgroundColor: colors.errorTint10,
  },

  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  dangerText: {
    color: colors.error,
  },
});
