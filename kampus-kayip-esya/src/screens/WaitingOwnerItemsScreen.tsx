import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { AdminBottomBar } from '../components/AdminBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { foundItemsService } from '../services/foundItemsService';
import { FoundItem, getFoundItemCategoryLabel, getFoundItemStatusLabel } from '../types/foundItem';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function WaitingOwnerItemsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();

  const [items, setItems] = useState<FoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const allItems = await foundItemsService.getFoundItems(token);
      const waiting = allItems.filter(
        i => i.status === 'WAITING_OWNER' || i.status === 'CLAIM_REQUESTED'
      );
      setItems(waiting);
    } catch (error) {
      console.error('Bekleyen eşyalar yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Bekleyen Eşyalar" showBack showNotification={false} />
        <ActivityIndicator size="large" color={colors.yeditepeBlue} style={{ marginTop: 40 }} />
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Bekleyen Eşyalar" showBack showNotification={false} />

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            style={styles.itemCard}
            onPress={() =>
              navigation.navigate('AdminItemDetail', { itemId: item.id })
            }
          >
            <View style={styles.imagePanel}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              ) : (
                <Ionicons name="image-outline" size={30} color={colors.textSecondary} />
              )}
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.itemContent}>
              <View style={styles.topRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Ionicons name="chevron-forward" size={19} color={colors.textSecondary} />
              </View>

              <View style={styles.metaRows}>
                <InfoLine icon="pricetag-outline" label="Kategori" value={getFoundItemCategoryLabel(item.category)} />
                <InfoLine icon="location-outline" label="Alan" value={item.location} />
                <InfoLine icon="calendar-outline" label="Tarih" value={item.foundDate} />
              </View>

              <View style={styles.statusBadge}>
                <Ionicons name="time-outline" size={13} color={colors.yeditepeBlue} />
                <Text style={styles.statusText}>{getFoundItemStatusLabel(item.status)}</Text>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.primaryAction}
                  onPress={() =>
                    navigation.navigate('AdminItemDetail', { itemId: item.id })
                  }
                >
                  <Ionicons name="eye-outline" size={15} color={colors.white} />
                  <Text style={styles.primaryActionText}>Detay</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        )}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kayıtlı Eşyalar</Text>
            <Text style={styles.sectionHint}>{items.length} eşya</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Bekleyen eşya yok</Text>
        }
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      <AdminBottomBar activeTab="panel" />
    </View>
  );
}

type InfoLineProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoLine({ icon, label, value }: InfoLineProps) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name={icon} size={14} color={colors.textSecondary} />

      <Text style={styles.infoLabel}>{label}:</Text>

      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
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
    paddingBottom: 185,
  },

  sectionHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  imagePanel: {
    width: 92,
    height: 126,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E7E8F0',
  },

  itemImage: {
    width: '100%',
    height: '100%',
  },

  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(193, 198, 211, 0.45)',
    marginHorizontal: 13,
    borderRadius: 1,
  },

  itemContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemTitle: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginRight: 8,
  },

  metaRows: {
    gap: 5,
    marginTop: 8,
  },

  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoLabel: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  infoValue: {
    marginLeft: 4,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 10,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.yeditepeBlue,
  },

  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },

  primaryAction: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  primaryActionText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '800',
  },

  secondaryAction: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 30,
  },
});