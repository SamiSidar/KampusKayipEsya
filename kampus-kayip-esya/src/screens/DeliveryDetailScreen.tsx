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
import { RouteProp, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { AdminBottomBar } from '../components/AdminBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { deliveriesService } from '../services/deliveriesService';
import { DeliveryRecord } from '../types/delivery';
import { getFoundItemCategoryLabel } from '../types/foundItem';

type DeliveryDetailRouteProp = RouteProp<RootStackParamList, 'DeliveryDetail'>;

export function DeliveryDetailScreen() {
  const route = useRoute<DeliveryDetailRouteProp>();
  const { token } = useAuth();
  const { deliveryId } = route.params;

  const [delivery, setDelivery] = useState<DeliveryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDelivery();
  }, []);

  async function loadDelivery() {
    try {
      const data = await deliveriesService.getDeliveryById(deliveryId, token);
      setDelivery(data);
    } catch (error) {
      console.error('Teslim detayı yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Teslim Detayı" showBack showNotification={false} />
        <ActivityIndicator size="large" color={colors.yeditepeBlue} style={{ marginTop: 40 }} />
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  if (!delivery) {
    return (
      <View style={styles.container}>
        <AppHeader title="Teslim Detayı" showBack showNotification={false} />
        <Text style={styles.emptyText}>Teslim kaydı bulunamadı</Text>
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Teslim Detayı" showBack showNotification={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusHeaderCard}>
          <View style={styles.statusIconBox}>
            <Ionicons name="checkmark-circle-outline" size={38} color={colors.success} />
          </View>
          <View style={styles.statusTextBlock}>
            <Text style={styles.statusTitle}>Teslim Edildi</Text>
            <Text style={styles.statusDescription}>
              Bu eşya sahibine teslim edilmiş ve geçmiş kayıt olarak arşivlenmiştir.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Eşya Bilgisi</Text>
          <View style={styles.infoList}>
            <InfoRow icon="card-outline" label="Eşya Adı:" value={delivery.item.title} />
            <InfoRow icon="pricetag-outline" label="Kategori:" value={getFoundItemCategoryLabel(delivery.item.category)} />
            <InfoRow icon="location-outline" label="Teslim Alındığı Alan:" value={delivery.item.location} />
            <InfoRow icon="calendar-outline" label="Bulunma Tarihi:" value={delivery.item.foundDate} />
            {delivery.item.storageLocation ? (
              <InfoRow icon="archive-outline" label="Kayıt Yeri:" value={delivery.item.storageLocation} />
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Teslim Bilgisi</Text>

          <View style={styles.personCard}>
            <View style={styles.personIcon}>
              <Ionicons name="person-outline" size={28} color={colors.yeditepeBlue} />
            </View>
            <View style={styles.personTextBlock}>
              <Text style={styles.personTitle}>Teslim Alan</Text>
              <Text style={styles.personText}>{delivery.deliveredToName}</Text>
            </View>
          </View>

          <View style={styles.infoList}>
            <InfoRow icon="person-outline" label="Teslim Alan:" value={delivery.deliveredToName} />
            {delivery.deliveredToStudentNumber ? (
              <InfoRow icon="card-outline" label="Öğrenci No:" value={delivery.deliveredToStudentNumber} />
            ) : null}
            <InfoRow icon="shield-checkmark-outline" label="Teslim Eden:" value={delivery.deliveredBy?.fullName || 'Güvenlik'} />
            <InfoRow icon="time-outline" label="Teslim Tarihi:" value={delivery.deliveredAt} />
            <InfoRow icon="information-circle-outline" label="Teslim Durumu:" value="Teslim Edildi" isStatus />
          </View>
        </View>

        {delivery.adminNote ? (
          <View style={styles.noteCard}>
            <View style={styles.noteIconBox}>
              <MaterialCommunityIcons name="note-text-outline" size={27} color={colors.yeditepeBlue} />
            </View>
            <View style={styles.noteTextBlock}>
              <Text style={styles.noteTitle}>Admin Notu</Text>
              <Text style={styles.noteText}>{delivery.adminNote}</Text>
            </View>
          </View>
        ) : null}

        <Pressable style={styles.archiveButton}>
          <Ionicons name="archive-outline" size={18} color={colors.yeditepeBlue} />
          <Text style={styles.archiveButtonText}>Kayıt Arşivde</Text>
        </Pressable>
      </ScrollView>

      <AdminBottomBar activeTab="panel" />
    </View>
  );
}

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isStatus?: boolean;
};

function InfoRow({ icon, label, value, isStatus = false }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelBlock}>
        <Ionicons name={icon} size={17} color={colors.textSecondary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      {isStatus ? (
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{value}</Text>
        </View>
      ) : (
        <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 185, gap: 16 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, fontSize: 14, marginTop: 40 },
  statusHeaderCard: {
    backgroundColor: colors.card, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center',
    shadowColor: colors.black, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  statusIconBox: {
    width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(46, 125, 50, 0.10)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  statusTextBlock: { flex: 1 },
  statusTitle: { fontSize: 17, fontWeight: '800', color: colors.success, marginBottom: 5 },
  statusDescription: { fontSize: 12.5, lineHeight: 18, color: colors.textSecondary },
  card: {
    backgroundColor: colors.card, borderRadius: 22, padding: 18,
    shadowColor: colors.black, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.yeditepeBlue, marginBottom: 14 },
  infoList: { gap: 11 },
  infoRow: {
    minHeight: 36, borderTopWidth: 1, borderTopColor: 'rgba(193, 198, 211, 0.24)', paddingTop: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  infoLabelBlock: { minWidth: 132, flexDirection: 'row', alignItems: 'center', gap: 7 },
  infoLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textSecondary },
  infoValue: { flex: 1, textAlign: 'right', fontSize: 12.8, fontWeight: '700', color: colors.textPrimary, lineHeight: 18 },
  statusPill: { backgroundColor: 'rgba(46, 125, 50, 0.10)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  statusPillText: { fontSize: 11, fontWeight: '800', color: colors.success },
  personCard: {
    backgroundColor: 'rgba(34, 113, 196, 0.08)', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center',
    marginBottom: 14, borderWidth: 1, borderColor: 'rgba(34, 113, 196, 0.14)',
  },
  personIcon: {
    width: 52, height: 52, borderRadius: 15, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  personTextBlock: { flex: 1 },
  personTitle: { fontSize: 12.5, fontWeight: '700', color: colors.textSecondary, marginBottom: 3 },
  personText: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  noteCard: {
    backgroundColor: colors.card, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: colors.black, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  noteIconBox: {
    width: 52, height: 52, borderRadius: 15, backgroundColor: 'rgba(34, 113, 196, 0.10)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  noteTextBlock: { flex: 1 },
  noteTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 },
  noteText: { fontSize: 12.8, lineHeight: 19, color: colors.textSecondary },
  archiveButton: {
    minHeight: 44, borderRadius: 22, backgroundColor: 'rgba(34, 113, 196, 0.10)',
    borderWidth: 1, borderColor: 'rgba(34, 113, 196, 0.20)',
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7,
  },
  archiveButtonText: { color: colors.yeditepeBlue, fontSize: 13.5, fontWeight: '800' },
});
