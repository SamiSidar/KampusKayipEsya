import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { StudentBottomBar } from '../components/StudentBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { getUserRoleLabel } from '../types/user';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const menuItems = [
  {
    id: '1',
    title: 'Kişisel Bilgiler',
    icon: 'person-outline' as keyof typeof Ionicons.glyphMap,
    danger: false,
  },
  {
    id: '2',
    title: 'Bildirim Ayarları',
    icon: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
    danger: false,
  },
  {
    id: '3',
    title: 'Yardım',
    icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
    danger: false,
  },
  {
    id: '4',
    title: 'Çıkış Yap',
    icon: 'log-out-outline' as keyof typeof Ionicons.glyphMap,
    danger: true,
  },
];

export function StudentProfileScreen() {
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

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => {
            const isLast = index === menuItems.length - 1;

            return (
              <Pressable
                key={item.id}
                style={[styles.menuItem, !isLast && styles.menuDivider]}
                onPress={item.danger ? handleLogout : undefined}
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
                      ? 'rgba(211, 47, 47, 0.50)'
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
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    fontWeight: '700',
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

  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(193, 198, 211, 0.45)',
  },

  menuIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F2F3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  menuIconCircleDanger: {
    backgroundColor: 'rgba(211, 47, 47, 0.10)',
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