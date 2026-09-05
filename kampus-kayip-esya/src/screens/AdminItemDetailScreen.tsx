import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { AdminBottomBar } from '../components/AdminBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { foundItemsService } from '../services/foundItemsService';
import { claimRequestsService } from '../services/claimRequestsService';
import {
  FoundItem,
  getFoundItemCategoryLabel,
  getFoundItemStatusLabel,
} from '../types/foundItem';
import { ClaimRequest, getClaimRequestStatusLabel } from '../types/claimRequest';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { InlineError } from '../components/InlineError';
import { useDialog } from '../components/AppDialog';

// ============================================================
// AdminItemDetailScreen — Bulunan eşya detayı (admin).
//
// Ne yapar:
// - Eşya bilgilerini ve bu eşya için gelen teslim taleplerini gösterir
// - Onaylanmış talep varsa 'Teslim Kaydı Oluştur' butonu öne çıkar;
//   eşya ancak teslim kaydıyla 'Teslim Edilen Eşyalar' listesine düşer
// - 'Düzenle' → FoundItemCreate ekranını düzenleme modunda açar
// - 'Sahibi Çıkmadı — Arşivle' → durumu ARCHIVED yapar (teslim DEĞİLDİR)
// - Teslim edilmiş/arşivlenmiş eşyada düzenleme ve arşivleme pasifleşir
//   (backend'deki FoundItemStatus.isEditable kuralıyla aynı)
//
// Ekran her odaklandığında yenilenir (useFocusEffect).
// ============================================================

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AdminItemDetailRouteProp = RouteProp<RootStackParamList, 'AdminItemDetail'>;

export function AdminItemDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AdminItemDetailRouteProp>();
  const { token } = useAuth();

  const { itemId } = route.params;

  // Uygulama içi diyalog — web'de window.alert/confirm yerine kullanılır
  const { alert, confirm } = useDialog();

  const [item, setItem] = useState<FoundItem | null>(null);
  const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [itemData, claims] = await Promise.all([
        foundItemsService.getFoundItemById(itemId, token),
        claimRequestsService.getClaimRequestsByItem(itemId, token),
      ]);
      setItem(itemData);
      setClaimRequests(claims);
    } catch (error) {
      console.error('Eşya detayı yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }, [itemId, token]);

  // Düzenleme ekranından dönüldüğünde veya arşivleme sonrası güncel veri gelsin
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function archiveItem() {
    setErrorMessage('');
    setIsProcessing(true);
    try {
      await foundItemsService.archiveFoundItem(itemId, token);
      await loadData();
      await alert({
        title: 'Eşya Arşivlendi',
        message: 'Kayıt arşive taşındı ve aktif listelerden çıkarıldı.',
        tone: 'success',
      });
    } catch (error: any) {
      setErrorMessage(error?.message || 'Arşivleme işlemi başarısız oldu.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function confirmArchive() {
    const approved = await confirm({
      title: 'Eşyayı Arşivle',
      message:
        'Bu eşyayı arşivlemek istediğinize emin misiniz? Arşivlenen eşya listelerde pasif hale gelir ve artık düzenlenemez.',
      tone: 'danger',
      confirmText: 'Arşivle',
      cancelText: 'Vazgeç',
    });

    if (approved) archiveItem();
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Eşya Detayı" showBack showNotification={false} />
        <ActivityIndicator
          size="large"
          color={colors.yeditepeBlue}
          style={{ marginTop: 40 }}
        />
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <AppHeader title="Eşya Detayı" showBack showNotification={false} />
        <Text style={styles.emptyText}>Eşya bulunamadı</Text>
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  const statusLabel = getFoundItemStatusLabel(item.status);

  // Backend kuralı (FoundItemStatus.isEditable): teslim edilmiş veya
  // arşivlenmiş eşya güncellenemez. Arşivleme de yalnızca aktif kayıtlarda.
  const isClosed = item.status === 'DELIVERED' || item.status === 'ARCHIVED';
  const canEdit = !isClosed && !isProcessing;

  // Onaylanmış ama henüz teslim kaydı oluşturulmamış talep var mı?
  // Varsa yapılacak iş ARŞİVLEMEK DEĞİL, teslim kaydı oluşturmaktır:
  // eşya ancak teslim kaydıyla "Teslim Edilen Eşyalar" listesine düşer.
  // Arşivleme sadece durumu ARCHIVED yapar, teslim kaydı üretmez.
  const approvedClaim = claimRequests.find(c => c.status === 'APPROVED');
  const canArchive = !isClosed && !isProcessing && !approvedClaim;

  return (
    <View style={styles.container}>
      <AppHeader title="Eşya Detayı" showBack showNotification={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {item.imageUrl ? (
          <View style={styles.imageCard}>
            <ImageWithFallback
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.imageBadge}>
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.yeditepeBlue}
              />
              <Text style={styles.imageBadgeText}>{statusLabel}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Eşya Bilgileri</Text>

          <View style={styles.infoList}>
            <InfoRow icon="cube-outline" label="Eşya Adı:" value={item.title} />
            <InfoRow
              icon="pricetag-outline"
              label="Kategori:"
              value={getFoundItemCategoryLabel(item.category)}
            />
            <InfoRow
              icon="location-outline"
              label="Teslim Alındığı Alan:"
              value={item.location}
            />
            <InfoRow
              icon="calendar-outline"
              label="Teslim Alınma Tarihi:"
              value={item.foundDate}
            />
            {item.description ? (
              <InfoRow
                icon="chatbubble-outline"
                label="Açıklama:"
                value={item.description}
                multiline
              />
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Depolama ve Durum</Text>

          {item.storageLocation ? (
            <View style={styles.storageCard}>
              <View style={styles.storageIcon}>
                <MaterialCommunityIcons
                  name="archive-lock-outline"
                  size={28}
                  color={colors.yeditepeBlue}
                />
              </View>
              <View style={styles.storageTextBlock}>
                <Text style={styles.storageTitle}>{item.storageLocation}</Text>
                <Text style={styles.storageText}>
                  Eşya güvenlik birimi tarafından muhafaza ediliyor.
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.infoList}>
            <InfoRow
              icon="shield-checkmark-outline"
              label="Kaydı Oluşturan:"
              value={item.createdBy?.fullName || 'Güvenlik Personeli'}
            />
            <InfoRow
              icon="information-circle-outline"
              label="Durum:"
              value={statusLabel}
              isStatus
            />
          </View>
        </View>

        {claimRequests.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Teslim Talepleri ({claimRequests.length})
            </Text>

            <View style={styles.claimList}>
              {claimRequests.map((claim) => {
                const statusLabel = getClaimRequestStatusLabel(claim.status);
                const isPending = claim.status === 'PENDING';
                const isApproved = claim.status === 'APPROVED' || claim.status === 'COMPLETED';

                return (
                  <Pressable
                    key={claim.id}
                    style={styles.claimCard}
                    onPress={() =>
                      navigation.navigate('AdminClaimRequestDetail', {
                        claimId: claim.id,
                      })
                    }
                    accessibilityLabel={`${claim.student?.fullName || 'Bilinmiyor'} talep detayı`}
                  >
                    <View style={styles.claimHeader}>
                      <View style={styles.claimPersonRow}>
                        <Ionicons
                          name="person-circle-outline"
                          size={22}
                          color={colors.yeditepeBlue}
                        />
                        <Text style={styles.claimPersonName}>
                          {claim.student?.fullName || 'Bilinmiyor'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.claimStatusBadge,
                          isPending && styles.claimStatusPending,
                          isApproved && styles.claimStatusApproved,
                        ]}
                      >
                        <Text
                          style={[
                            styles.claimStatusText,
                            isPending && styles.claimStatusTextPending,
                            isApproved && styles.claimStatusTextApproved,
                          ]}
                        >
                          {statusLabel}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.claimBody}>
                      <View style={styles.claimField}>
                        <Text style={styles.claimFieldLabel}>Açıklama:</Text>
                        <Text style={styles.claimFieldValue} numberOfLines={2}>
                          {claim.description}
                        </Text>
                      </View>
                      <View style={styles.claimField}>
                        <Text style={styles.claimFieldLabel}>Ayırt Edici Özellik:</Text>
                        <Text style={styles.claimFieldValue} numberOfLines={2}>
                          {claim.distinguishingFeature}
                        </Text>
                      </View>
                      {claim.additionalNote ? (
                        <View style={styles.claimField}>
                          <Text style={styles.claimFieldLabel}>Ek Not:</Text>
                          <Text style={styles.claimFieldValue} numberOfLines={2}>
                            {claim.additionalNote}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.claimFooter}>
                      <Text style={styles.claimDate}>
                        {claim.createdAt}
                      </Text>
                      <View style={styles.claimDetailLink}>
                        <Text style={styles.claimDetailLinkText}>Detay</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={colors.yeditepeBlue}
                        />
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.actionCard}>
          <Text style={styles.cardTitle}>Admin İşlemleri</Text>

          <Text style={styles.actionDescription}>
            {isClosed
              ? `Bu eşya "${statusLabel}" durumunda olduğu için üzerinde değişiklik yapılamaz.`
              : approvedClaim
              ? 'Onaylanmış bir teslim talebi bekliyor. Sıradaki adım teslim kaydı oluşturmaktır.'
              : 'Bu eşya için kayıt bilgilerini düzenleyebilir, teslim taleplerini görüntüleyebilir veya sahibi çıkmayan eşyayı arşivleyebilirsiniz.'}
          </Text>

          {approvedClaim ? (
            <View style={styles.nextStepBox}>
              <Ionicons
                name="arrow-forward-circle-outline"
                size={22}
                color={colors.success}
              />
              <Text style={styles.nextStepText}>
                Bu eşyanın onaylanmış bir teslim talebi var
                ({approvedClaim.student?.fullName || 'öğrenci'}). Eşyayı
                sahibine verdiğinizde <Text style={styles.nextStepBold}>Teslim
                Kaydı Oluştur</Text> deyin — eşya ancak o zaman "Teslim Edilen
                Eşyalar" listesine düşer. Arşivleme teslim kaydı oluşturmaz.
              </Text>
            </View>
          ) : null}

          <View style={styles.buttonGroup}>
            {approvedClaim ? (
              <Pressable
                style={styles.deliveryButton}
                onPress={() =>
                  navigation.navigate('DeliveryCreation', {
                    claimId: approvedClaim.id,
                  })
                }
                accessibilityLabel="Teslim kaydı oluştur"
              >
                <Ionicons
                  name="cube-outline"
                  size={19}
                  color={colors.white}
                />
                <Text style={styles.primaryButtonText}>Teslim Kaydı Oluştur</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={[styles.editButton, !canEdit && styles.disabledButton]}
              onPress={() => navigation.navigate('FoundItemCreate', { itemId })}
              disabled={!canEdit}
              accessibilityState={{ disabled: !canEdit }}
              accessibilityLabel="Eşyayı düzenle"
            >
              <Ionicons
                name="create-outline"
                size={19}
                color={colors.yeditepeBlue}
              />
              <Text style={styles.editButtonText}>Düzenle</Text>
            </Pressable>

            <Pressable
              style={[styles.closeButton, !canArchive && styles.disabledButton]}
              accessibilityLabel="Sahibi çıkmadı, eşyayı arşivle"
              disabled={!canArchive}
              accessibilityState={{ disabled: !canArchive }}
              onPress={confirmArchive}
            >
              <Ionicons name="archive-outline" size={19} color={colors.white} />
              <Text style={styles.primaryButtonText}>
                {isProcessing ? 'İşleniyor...' : 'Sahibi Çıkmadı — Arşivle'}
              </Text>
            </Pressable>
          </View>

          <InlineError message={errorMessage} />
        </View>
      </ScrollView>

      <AdminBottomBar activeTab="panel" />
    </View>
  );
}

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  multiline?: boolean;
  isStatus?: boolean;
};

function InfoRow({
  icon,
  label,
  value,
  multiline = false,
  isStatus = false,
}: InfoRowProps) {
  return (
    <View style={[styles.infoRow, multiline && styles.infoRowTop]}>
      <View style={styles.infoLabelBlock}>
        <Ionicons name={icon} size={17} color={colors.textSecondary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>

      {isStatus ? (
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{value}</Text>
        </View>
      ) : (
        <Text
          style={[styles.infoValue, multiline && styles.infoValueMultiline]}
          numberOfLines={multiline ? 5 : 2}
        >
          {value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 185,
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 40,
  },
  imageCard: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.surfaceDivider,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  itemImage: { width: '100%', height: '100%' },
  imageBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  imageBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.yeditepeBlue,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  actionCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.yeditepeBlue,
    marginBottom: 14,
  },
  infoList: { gap: 11 },
  infoRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight22,
    paddingTop: 10,
  },
  infoRowTop: { alignItems: 'flex-start' },
  infoLabelBlock: {
    minWidth: 136,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  infoLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12.8,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  infoValueMultiline: { fontWeight: '600' },
  statusPill: {
    backgroundColor: colors.blueTint10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.yeditepeBlue,
  },
  storageCard: {
    backgroundColor: colors.blueTint08,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.blueTint14,
  },
  storageIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  storageTextBlock: { flex: 1 },
  storageTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  storageText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  claimList: { gap: 12 },
  claimCard: {
    backgroundColor: colors.blueTint05,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.blueTint12,
  },
  claimHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  claimPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  claimPersonName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  claimStatusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: colors.borderLight25,
  },
  claimStatusPending: {
    backgroundColor: colors.warningTint12,
  },
  claimStatusApproved: {
    backgroundColor: colors.successTint12,
  },
  claimStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  claimStatusTextPending: {
    color: colors.warning,
  },
  claimStatusTextApproved: {
    color: colors.success,
  },
  claimBody: { gap: 8 },
  claimField: { gap: 2 },
  claimFieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  claimFieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  claimFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight25,
  },
  claimDate: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  claimDetailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  claimDetailLinkText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.yeditepeBlue,
  },
  actionDescription: {
    fontSize: 12.8,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  buttonGroup: { gap: 10 },
  editButton: {
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: colors.blueTint10,
    borderWidth: 1,
    borderColor: colors.blueTint22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  editButtonText: {
    color: colors.yeditepeBlue,
    fontSize: 14,
    fontWeight: '800',
  },
  closeButton: {
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  disabledButton: { opacity: 0.45 },
  deliveryButton: {
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  nextStepBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.successTint10,
    borderRadius: 16,
    padding: 13,
    marginBottom: 14,
  },
  nextStepText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
    color: colors.textPrimary,
  },
  nextStepBold: {
    fontWeight: '800',
    color: colors.success,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
