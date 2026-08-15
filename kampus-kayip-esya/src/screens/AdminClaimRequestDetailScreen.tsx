import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { AdminBottomBar } from '../components/AdminBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { claimRequestsService } from '../services/claimRequestsService';
import {
  ClaimRequest,
  getClaimRequestStatusLabel,
} from '../types/claimRequest';
import { getFoundItemCategoryLabel, getFoundItemStatusLabel } from '../types/foundItem';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AdminClaimRouteProp = RouteProp<
  RootStackParamList,
  'AdminClaimRequestDetail'
>;

export function AdminClaimRequestDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AdminClaimRouteProp>();
  const { token } = useAuth();

  const { claimId } = route.params;

  const [claim, setClaim] = useState<ClaimRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadClaim();
  }, []);

  async function loadClaim() {
    try {
      const data = await claimRequestsService.getClaimRequestById(claimId, token);
      setClaim(data);
    } catch (error) {
      console.error('Talep detayı yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove() {
    setIsProcessing(true);
    try {
      await claimRequestsService.approveClaimRequest(claimId, 'Talep onaylandı.', token);
      Alert.alert('Başarılı', 'Teslim talebi onaylandı.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error?.message || 'Onaylama başarısız.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject() {
    setIsProcessing(true);
    try {
      await claimRequestsService.rejectClaimRequest(claimId, 'Talep reddedildi.', token);
      Alert.alert('Başarılı', 'Teslim talebi reddedildi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error?.message || 'Reddetme başarısız.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRequestInfo() {
    setIsProcessing(true);
    try {
      await claimRequestsService.requestMoreInfo(claimId, 'Lütfen ek bilgi sağlayın.', token);
      Alert.alert('Başarılı', 'Ek bilgi istendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error?.message || 'İşlem başarısız.');
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Teslim Talebi Detayı" showBack showNotification={false} />
        <ActivityIndicator size="large" color={colors.yeditepeBlue} style={{ marginTop: 40 }} />
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={styles.container}>
        <AppHeader title="Teslim Talebi Detayı" showBack showNotification={false} />
        <Text style={styles.emptyText}>Talep bulunamadı</Text>
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Teslim Talebi Detayı" showBack showNotification={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusIconBox}>
            <Ionicons name="hourglass-outline" size={35} color={colors.yeditepeBlue} />
          </View>
          <View style={styles.statusTextBlock}>
            <Text style={styles.statusTitle}>
              {getClaimRequestStatusLabel(claim.status)}
            </Text>
            <Text style={styles.statusDescription}>
              Öğrencinin teslim talebini inceleyerek uygun işlemi seçin.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Talep Edilen Eşya</Text>

          <View style={styles.itemSummaryCard}>
            <View style={styles.itemIconBox}>
              <MaterialCommunityIcons
                name="wallet-outline"
                size={30}
                color={colors.yeditepeBlue}
              />
            </View>
            <View style={styles.itemTextBlock}>
              <Text style={styles.itemTitle}>{claim.item.title}</Text>
              <Text style={styles.itemMeta}>
                {claim.item.location} • Kayıtlı eşya
              </Text>
              <View style={styles.itemStatusBadge}>
                <Ionicons name="time-outline" size={13} color={colors.yeditepeBlue} />
                <Text style={styles.itemStatusText}>
                  {getFoundItemStatusLabel(claim.item.status)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoList}>
            <InfoRow
              icon="pricetag-outline"
              label="Kategori:"
              value={getFoundItemCategoryLabel(claim.item.category)}
            />
            <InfoRow icon="location-outline" label="Teslim Alanı:" value={claim.item.location} />
            {claim.item.storageLocation ? (
              <InfoRow icon="archive-outline" label="Depolama Yeri:" value={claim.item.storageLocation} />
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Talep Eden Öğrenci</Text>

          <View style={styles.studentCard}>
            <View style={styles.studentIconBox}>
              <Ionicons name="person-outline" size={29} color={colors.yeditepeBlue} />
            </View>
            <View style={styles.studentTextBlock}>
              <Text style={styles.studentName}>{claim.student.fullName}</Text>
              <Text style={styles.studentMeta}>Öğrenci Teslim Talebi</Text>
            </View>
          </View>

          <View style={styles.infoList}>
            <InfoRow icon="person-outline" label="Ad Soyad:" value={claim.student.fullName} />
            <InfoRow icon="mail-outline" label="İletişim:" value={claim.student.email} />
            <InfoRow icon="calendar-outline" label="Talep Tarihi:" value={claim.createdAt} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Öğrenci Açıklaması</Text>

          <View style={styles.answerBlock}>
            <Text style={styles.answerLabel}>Bu eşyayı nasıl tanıyorsunuz?</Text>
            <Text style={styles.answerText}>{claim.description}</Text>
          </View>

          <View style={styles.answerBlock}>
            <Text style={styles.answerLabel}>Ayırt edici özelliği var mı?</Text>
            <Text style={styles.answerText}>{claim.distinguishingFeature}</Text>
          </View>

          {claim.additionalNote ? (
            <View style={styles.answerBlockLast}>
              <Text style={styles.answerLabel}>Ek açıklama</Text>
              <Text style={styles.answerText}>{claim.additionalNote}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.noteCard}>
          <View style={styles.noteIconBox}>
            <Ionicons name="information-circle-outline" size={25} color={colors.yeditepeBlue} />
          </View>
          <View style={styles.noteTextBlock}>
            <Text style={styles.noteTitle}>Kontrol Notu</Text>
            <Text style={styles.noteText}>
              Talebi onaylamadan önce öğrencinin kimlik doğrulaması yapılarak
              eşya üzerindeki bilgilerle karşılaştırılması önerilir.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
        <Text style={styles.footerTitle}>Admin İşlemleri</Text>

        <View style={styles.buttonGroup}>
          <Pressable
            style={[styles.approveButton, isProcessing && styles.disabledButton]}
            onPress={handleApprove}
            disabled={isProcessing}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
            <Text style={styles.primaryButtonText}>Talebi Onayla</Text>
          </Pressable>

          <Pressable
            style={[styles.revisionButton, isProcessing && styles.disabledButton]}
            onPress={handleRequestInfo}
            disabled={isProcessing}
          >
            <Ionicons name="create-outline" size={18} color={colors.white} />
            <Text style={styles.primaryButtonText}>Ek Bilgi İste</Text>
          </Pressable>

          <Pressable
            style={[styles.rejectButton, isProcessing && styles.disabledButton]}
            onPress={handleReject}
            disabled={isProcessing}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.white} />
            <Text style={styles.primaryButtonText}>Talebi Reddet</Text>
          </Pressable>
        </View>
      </View>

      <AdminBottomBar activeTab="panel" />
    </View>
  );
}

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelBlock}>
        <Ionicons name={icon} size={17} color={colors.textSecondary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 24, gap: 16 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, fontSize: 14, marginTop: 40 },
  statusCard: {
    backgroundColor: colors.card, borderRadius: 22, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: colors.black, shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 4,
    borderWidth: 1, borderColor: 'rgba(34, 113, 196, 0.18)',
  },
  statusIconBox: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  statusTextBlock: { flex: 1 },
  statusTitle: { fontSize: 17, fontWeight: '800', color: colors.yeditepeBlue, marginBottom: 5 },
  statusDescription: { fontSize: 12.5, lineHeight: 18, color: colors.textSecondary },
  card: {
    backgroundColor: colors.card, borderRadius: 22, padding: 18,
    shadowColor: colors.black, shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.yeditepeBlue, marginBottom: 14 },
  itemSummaryCard: {
    backgroundColor: 'rgba(34, 113, 196, 0.08)', borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(34, 113, 196, 0.14)',
  },
  itemIconBox: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', marginRight: 13,
  },
  itemTextBlock: { flex: 1 },
  itemTitle: { fontSize: 15.5, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  itemMeta: { fontSize: 12.5, color: colors.textSecondary, marginBottom: 8 },
  itemStatusBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(34, 113, 196, 0.10)', paddingHorizontal: 9,
    paddingVertical: 5, borderRadius: 13,
  },
  itemStatusText: { color: colors.yeditepeBlue, fontSize: 10.5, fontWeight: '800' },
  studentCard: {
    backgroundColor: 'rgba(34, 113, 196, 0.08)', borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(34, 113, 196, 0.14)',
  },
  studentIconBox: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', marginRight: 13,
  },
  studentTextBlock: { flex: 1 },
  studentName: { fontSize: 15.5, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  studentMeta: { fontSize: 12.5, color: colors.textSecondary },
  infoList: { gap: 11 },
  infoRow: {
    minHeight: 36, borderTopWidth: 1, borderTopColor: 'rgba(193, 198, 211, 0.24)',
    paddingTop: 10, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 12,
  },
  infoLabelBlock: { minWidth: 126, flexDirection: 'row', alignItems: 'center', gap: 7 },
  infoLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textSecondary },
  infoValue: { flex: 1, textAlign: 'right', fontSize: 12.8, fontWeight: '700', color: colors.textPrimary, lineHeight: 18 },
  answerBlock: {
    paddingBottom: 14, marginBottom: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(193, 198, 211, 0.30)',
  },
  answerBlockLast: { paddingBottom: 0 },
  answerLabel: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, marginBottom: 7 },
  answerText: { fontSize: 12.8, lineHeight: 19, color: colors.textSecondary },
  noteCard: {
    backgroundColor: colors.card, borderRadius: 22, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: colors.black, shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  noteIconBox: {
    width: 52, height: 52, borderRadius: 15,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  noteTextBlock: { flex: 1 },
  noteTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 },
  noteText: { fontSize: 12.8, lineHeight: 19, color: colors.textSecondary },
  footerActions: {
    backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(193, 198, 211, 0.35)',
  },
  footerTitle: { fontSize: 12, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 },
  buttonGroup: { gap: 6 },
  approveButton: {
    minHeight: 38, borderRadius: 19, backgroundColor: colors.yeditepeBlue,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
  },
  revisionButton: {
    minHeight: 38, borderRadius: 19, backgroundColor: colors.warning,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
  },
  rejectButton: {
    minHeight: 38, borderRadius: 19, backgroundColor: colors.error,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: colors.white, fontSize: 12.5, fontWeight: '800' },
});
