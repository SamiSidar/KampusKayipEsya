import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { AdminBottomBar } from '../components/AdminBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

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

export function AdminProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  }

  function handleMenuPress(action: MenuItem['action']) {
    switch (action) {
      case 'personalInfo':
        navigation.navigate('PersonalInfo');
        break;
      case 'notifications':
        Alert.alert(
          'Bildirim Ayarları',
          'Bildirim ayarları yakında eklenecektir.',
          [{ text: 'Tamam' }]
        );
        break;
      case 'help':
        Alert.alert(
          'Yardım',
          'Kampüs Kayıp Eşya Uygulaması\nYeditepe Üniversitesi\n\nSorun veya önerileriniz için:\nkampuskayipesya@yeditepe.edu.tr',
          [{ text: 'Tamam' }]
        );
        break;
      case 'logout':
        handleLogout();
        break;
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Profil" showBack={false} showNotification={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.blueBackground} />

        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Ionicons
              name="person-outline"
              size={44}
              color={colors.yeditepeBlue}
            />
          </View>

          <Text style={styles.name}>{user?.fullName ?? 'Yönetici'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>

          <View style={styles.roleBadge}>
            <MaterialCommunityIcons
              name="shield-account-outline"
              size={16}
              color={colors.yeditepeBlue}
            />
            <Text style={styles.roleBadgeText}>Yönetici</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => {
            const isLast = index === menuItems.length - 1;

            return (
              <Pressable accessibilityRole="button"
                key={item.id}
                style={[styles.menuItem, !isLast && styles.menuDivider]}
                onPress={() => handleMenuPress(item.action)}
                accessibilityLabel={item.title}
              >
                <View
                  style={[
                    styles.menuIconCircle,
                    item.danger && styles.menuIconCircleDanger,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={item.danger ? colors.error : colors.textSecondary}
                  />
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

      <AdminBottomBar activeTab="profile" />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 130,
  },

  blueBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: colors.yeditepeBlue,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
    marginTop: 12,
  },

  avatarWrapper: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.blueTint10,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.black,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 6,
  },

  name: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.yeditepeBlue,
    marginBottom: 5,
    textAlign: 'center',
  },

  email: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },

  roleBadge: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.blueTint10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.yeditepeBlue,
  },

  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  menuItem: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
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