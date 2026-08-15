import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { AdminBottomBar } from '../components/AdminBottomBar';
import { RootStackParamList } from '../navigation/types';

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

export function AdminProfileScreen() {
  const navigation = useNavigation<NavigationProp>();

  function handleLogout() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
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

          <Text style={styles.name}>Güvenlik Personeli</Text>
          <Text style={styles.email}>guvenlik@yeditepe.edu.tr</Text>

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
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
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
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
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