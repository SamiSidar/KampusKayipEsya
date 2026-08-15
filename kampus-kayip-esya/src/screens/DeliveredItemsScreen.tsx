import React, { useState, useEffect } from 'react';
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
import { AdminBottomBar } from '../components/AdminBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { deliveriesService } from '../services/deliveriesService';
import { DeliveryRecord } from '../types/delivery';
import { FoundItemCategory, getFoundItemCategoryLabel } from '../types/foundItem';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getCategoryIcon(
  category: FoundItemCategory
): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (category) {
    case 'WALLET': return 'wallet-outline';
    case 'KEY': return 'key-outline';
    case 'ELECTRONIC': return 'headphones';
    case 'BAG': return 'bag-personal-outline';
    case 'CARD': return 'card-account-details-outline';
    case 'ACCESSORY': return 'glasses';
    default: return 'package-variant-closed';
  }
}

export function DeliveredItemsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();

  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  async function loadDeliveries() {
    try {
      const data = await deliveriesService.getDeliveries(token);
      setDeliveries(data);
    } catch (error) {
      console.error('Teslim kayıtları yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Teslim Edilen" showBack showNotification={false} />
        <ActivityIndicator size="large" color={colors.yeditepeBlue} style={{ marginTop: 40 }} />
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Teslim Edilen" showBack showNotification={false} />

      <FlatList
        data={deliveries}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: delivery }) => (
          <Pressable
            style={styles.itemCard}
            onPress={() =>
              navigation.navigate('DeliveryDetail', { deliveryId: delivery.id })
            }
          >
            <View style={styles.iconPanel}>
              <MaterialCommunityIcons
                name={getCategoryIcon(delivery.item.category)}
                size={29}
                color={colors.yeditepeBlue}
              />
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.itemContent}>
              <View style={styles.topRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {delivery.item.title}
                </Text>

                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle-outline" size={13} color={colors.success} />
                  <Text style={styles.statusText}>Teslim Edildi</Text>
                </View>
              </View>

              <View style={styles.metaRows}>
                <InfoLine
                  icon="pricetag-outline"
                  label="Kategori"
                  value={getFoundItemCategoryLabel(delivery.item.category)}
                />
                <InfoLine
                  icon="person-outline"
                  label="Teslim Alan"
                  value={delivery.deliveredToName}
                />
                <InfoLine
                  icon="shield-checkmark-outline"
                  label="Teslim Eden"
                  value={delivery.deliveredBy?.fullName || 'Güvenlik'}
                />
                <InfoLine
                  icon="calendar-outline"
                  label="Teslim Tarihi"
                  value={delivery.deliveredAt}
                />
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.detailButton}
                  onPress={() =>
                    navigation.navigate('DeliveryDetail', { deliveryId: delivery.id })
                  }
                >
                  <Ionicons name="document-text-outline" size={15} color={colors.yeditepeBlue} />
                  <Text style={styles.detailButtonText}>Teslim Detayı</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        )}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Geçmiş Teslimler</Text>
            <Text style={styles.sectionHint}>{deliveries.length} kayıt</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Teslim kaydı yok</Text>
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
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 185 },
  sectionHeader: {
    marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  sectionHint: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  emptyText: { textAlign: 'center', color: colors.textSecondary, fontSize: 14, marginTop: 30 },
  itemCard: {
    backgroundColor: colors.card, borderRadius: 22, padding: 14, flexDirection: 'row',
    shadowColor: colors.black, shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  iconPanel: {
    width: 72, height: 112, borderRadius: 18,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  verticalDivider: {
    width: 1, backgroundColor: 'rgba(193, 198, 211, 0.45)', marginHorizontal: 13, borderRadius: 1,
  },
  itemContent: { flex: 1, minWidth: 0, justifyContent: 'space-between', paddingVertical: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  itemTitle: { flex: 1, fontSize: 15.5, fontWeight: '800', color: colors.textPrimary, marginRight: 8 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(46, 125, 50, 0.10)', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 14,
  },
  statusText: { fontSize: 10.5, fontWeight: '800', color: colors.success },
  metaRows: { gap: 5, marginTop: 8 },
  infoLine: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { marginLeft: 5, fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  infoValue: { marginLeft: 4, flex: 1, fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  actionRow: { marginTop: 12, alignItems: 'flex-start' },
  detailButton: {
    minHeight: 38, paddingHorizontal: 16, borderRadius: 19,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
  },
  detailButtonText: { color: colors.yeditepeBlue, fontSize: 12.5, fontWeight: '800' },
});
