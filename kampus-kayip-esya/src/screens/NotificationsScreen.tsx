import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { StudentBottomBar } from '../components/StudentBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { notificationsService } from '../services/notificationsService';
import { AppNotification, NotificationType } from '../types/notification';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getNotificationVisual(type: NotificationType) {
  if (type === 'REPORT_APPROVED' || type === 'CLAIM_APPROVED') {
    return {
      icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
      iconColor: colors.success,
      background: 'rgba(46, 125, 50, 0.10)',
      material: false,
    };
  }

  if (type === 'MATCH_FOUND') {
    return {
      icon: 'archive-search-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: colors.yeditepeBlue,
      background: 'rgba(34, 113, 196, 0.10)',
      material: true,
    };
  }

  if (type === 'ITEM_DELIVERED') {
    return {
      icon: 'cube-send' as keyof typeof MaterialCommunityIcons.glyphMap,
      iconColor: colors.yeditepeBlue,
      background: 'rgba(34, 113, 196, 0.10)',
      material: true,
    };
  }

  return {
    icon: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
    iconColor: colors.textSecondary,
    background: '#F2F3FB',
    material: false,
  };
}

export function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationsService.getNotifications(token);
      setNotifications(data);
    } catch (error) {
      console.error('Bildirimler yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleNotificationPress = useCallback(async (notification: AppNotification) => {
    if (!notification.read) {
      try {
        await notificationsService.markAsRead(notification.id, token);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error('Okundu işaretlenemedi:', error);
      }
    }

    if (notification.reportId) {
      navigation.navigate('StudentReportDetail', {
        reportId: notification.reportId,
      });
    } else if (notification.itemId) {
      navigation.navigate('ItemDetail', {
        itemId: notification.itemId,
      });
    }
  }, [token, navigation]);

  return (
    <View style={styles.container}>
      <AppHeader title="Bildirimler" showBack showNotification={false} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: notification }) => {
          const visual = getNotificationVisual(notification.type);
          const unread = !notification.read;

          return (
            <Pressable
              style={[
                styles.notificationCard,
                unread && styles.unreadCard,
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              {unread ? <View style={styles.leftAccent} /> : null}

              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: visual.background },
                ]}
              >
                {visual.material ? (
                  <MaterialCommunityIcons
                    name={
                      visual.icon as keyof typeof MaterialCommunityIcons.glyphMap
                    }
                    size={26}
                    color={visual.iconColor}
                  />
                ) : (
                  <Ionicons
                    name={visual.icon as keyof typeof Ionicons.glyphMap}
                    size={26}
                    color={visual.iconColor}
                  />
                )}
              </View>

              <View style={styles.textBlock}>
                <View style={styles.topRow}>
                  <Text style={styles.notificationTitle} numberOfLines={1}>
                    {notification.title}
                  </Text>

                  {unread ? <View style={styles.unreadDot} /> : null}
                </View>

                <Text
                  style={styles.notificationDescription}
                  numberOfLines={3}
                >
                  {notification.description}
                </Text>

                <View style={styles.bottomRow}>
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.timeText}>
                    {notification.createdAt}
                  </Text>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={colors.textSecondary}
                style={styles.chevron}
              />
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Bildirimler</Text>
            <Text style={styles.sectionHint}>
              {notifications.length} bildirim
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.yeditepeBlue}
              style={{ marginTop: 20 }}
            />
          ) : (
            <Text style={styles.emptyText}>Bildirim yok</Text>
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: 13 }} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      <StudentBottomBar activeTab="reports" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 150,
  },

  sectionHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  sectionHint: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 20,
  },

  notificationCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  unreadCard: {
    borderWidth: 1,
    borderColor: 'rgba(34, 113, 196, 0.18)',
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.08,
  },

  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: colors.yeditepeBlue,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  textBlock: {
    flex: 1,
    minWidth: 0,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  notificationTitle: {
    flex: 1,
    fontSize: 14.8,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.yeditepeBlue,
    marginLeft: 7,
  },

  notificationDescription: {
    fontSize: 12.6,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: 7,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  timeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  chevron: {
    marginLeft: 8,
  },
});