import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { notificationsService } from '../services/notificationsService';

type AppHeaderProps = {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function AppHeader({
  title,
  showBack = true,
  showNotification = true,
}: AppHeaderProps) {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!showNotification || !token) return;

    let mounted = true;

    async function fetchUnreadCount() {
      try {
        const count = await notificationsService.getUnreadCount(token);
        if (mounted) setUnreadCount(count);
      } catch {
        // Sessiz hata — header render'ı engellenmemeli
      }
    }

    fetchUnreadCount();

    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [showNotification, token]);

  function handleBackPress() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }

  function handleNotificationPress() {
    navigation.navigate('Notifications');
  }

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable accessibilityRole="button" style={styles.iconButton} onPress={handleBackPress} accessibilityLabel="Geri dön">
            <Ionicons name="chevron-back" size={27} color={colors.white} />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.side}>
        {showNotification ? (
          <Pressable accessibilityRole="button"
            style={styles.rightIconButton}
            onPress={handleNotificationPress}
            accessibilityLabel="Bildirimler"
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.white}
            />
            {unreadCount > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 72,
    backgroundColor: colors.yeditepeBlue,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 6,
  },

  side: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconButton: {
    width: 40,
    minHeight: 44,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightIconButton: {
    width: 38,
    minHeight: 44,
    borderRadius: 19,
    backgroundColor: colors.whiteAlpha12,
    borderWidth: 1,
    borderColor: colors.whiteAlpha20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    flex: 1,
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  notificationBadge: {
    position: 'absolute',
    right: 4,
    top: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  notificationBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
  },
});
