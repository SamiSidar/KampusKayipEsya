import React, { useState, useEffect } from 'react';
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AdminItemDetailRouteProp = RouteProp<RootStackParamList, 'AdminItemDetail'>;

export function AdminItemDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AdminItemDetailRouteProp>();
  const { token } = useAuth();

  const { itemId } = route.params;

  const [item, setItem] = useState<FoundItem | null>(null);
  const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
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
            <Image
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
            Bu eşya için kayıt bilgilerini düzenleyebilir, teslim taleplerini
            görüntüleyebilir veya eşyanın durumunu değiştirebilirsiniz.
          </Text>

          <View style={styles.buttonGroup}>
            <Pressable
              style={styles.editButton}
              onPress={() => navigation.navigate('FoundItemCreate')}
            >
              <Ionicons
                name="create-outline"
                size={19}
                color={colors.yeditepeBlue}
              />
              <Text style={styles.editButtonText}>Düzenle</Text>
            </Pressable>

            <Pressable style={styles.closeButton}>
              <Ionicons name="archive-outline" size={19} color={colors.white} />
              <Text style={styles.primaryButtonText}>Kapat / Arşivle</Text>
            </Pressable>
          </View>
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
    backgroundColor: '#E7E8F0',
    borderWidth: 1,
    borderColor: '#E1E4ED',
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
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(193, 198, 211, 0.22)',
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
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
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
    backgroundColor: 'rgba(34, 113, 196, 0.08)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 113, 196, 0.14)',
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
    backgroundColor: 'rgba(34, 113, 196, 0.05)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 113, 196, 0.12)',
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
    backgroundColor: 'rgba(193, 198, 211, 0.25)',
  },
  claimStatusPending: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
  },
  claimStatusApproved: {
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
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
    borderTopColor: 'rgba(193, 198, 211, 0.25)',
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
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(34, 113, 196, 0.22)',
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
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
