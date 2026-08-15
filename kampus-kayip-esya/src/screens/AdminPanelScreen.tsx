import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { AdminBottomBar } from '../components/AdminBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { dashboardService, DashboardStats } from '../services/dashboardService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function AdminPanelScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await dashboardService.getStats(token);
      setStats(data);
    } catch (error) {
      console.error('Dashboard yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const adminCards = [
    {
      id: 'pending' as const,
      title: 'Onay Bekleyen',
      subtitle: 'Kayıp eşya bildirileri',
      count: String(stats?.pendingReportsCount ?? '-'),
      iconSet: 'material' as const,
      icon: 'clipboard-clock-outline',
    },
    {
      id: 'waitingOwner' as const,
      title: 'Sahibi Bekleyen',
      subtitle: 'Teslim alınan eşyalar',
      count: String(stats?.waitingOwnerItemsCount ?? '-'),
      iconSet: 'material' as const,
      icon: 'archive-search-outline',
    },
    {
      id: 'activeLost' as const,
      title: 'Aktif Kayıp',
      subtitle: 'Onaylı kayıp bildirileri',
      count: String(stats?.activeLostReportsCount ?? '-'),
      iconSet: 'ion' as const,
      icon: 'document-text-outline',
    },
    {
      id: 'delivered' as const,
      title: 'Teslim Edilen',
      subtitle: 'Geçmiş teslim kayıtları',
      count: String(stats?.deliveredItemsCount ?? '-'),
      iconSet: 'ion' as const,
      icon: 'checkmark-done-circle-outline',
    },
  ];

  function handleCardPress(cardId: string) {
    if (cardId === 'pending') {
      navigation.navigate('PendingReports');
    } else if (cardId === 'waitingOwner') {
      navigation.navigate('WaitingOwnerItems');
    } else if (cardId === 'activeLost') {
      navigation.navigate('ActiveLostReports');
    } else if (cardId === 'delivered') {
      navigation.navigate('DeliveredItems');
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Admin Paneli" showBack={false} showNotification />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Genel Durum</Text>
          <Text style={styles.sectionHint}>Bugün</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.yeditepeBlue}
            style={{ marginTop: 40 }}
          />
        ) : (
          <View style={styles.grid}>
            {adminCards.map(card => (
              <Pressable
                key={card.id}
                style={styles.dashboardCard}
                onPress={() => handleCardPress(card.id)}
              >
                <View style={styles.iconBox}>
                  {card.iconSet === 'material' ? (
                    <MaterialCommunityIcons
                      name={
                        card.icon as keyof typeof MaterialCommunityIcons.glyphMap
                      }
                      size={30}
                      color={colors.yeditepeBlue}
                    />
                  ) : (
                    <Ionicons
                      name={card.icon as keyof typeof Ionicons.glyphMap}
                      size={30}
                      color={colors.yeditepeBlue}
                    />
                  )}
                </View>

                <Text style={styles.cardCount}>{card.count}</Text>

                <Text style={styles.cardTitle} numberOfLines={2}>
                  {card.title}
                </Text>

                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  {card.subtitle}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>Görüntüle</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={15}
                    color={colors.yeditepeBlue}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <AdminBottomBar activeTab="panel" />
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
    paddingTop: 18,
    paddingBottom: 120,
  },

  sectionHeader: {
    marginBottom: 14,
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

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },

  dashboardCard: {
    width: '48%',
    minHeight: 188,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  cardCount: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: colors.yeditepeBlue,
    marginBottom: 7,
  },

  cardTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 6,
  },

  cardSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: colors.textSecondary,
    minHeight: 34,
  },

  cardFooter: {
    marginTop: 12,
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  cardFooterText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.yeditepeBlue,
  },
});