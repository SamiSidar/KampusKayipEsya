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
import { Ionicons } from '@expo/vector-icons';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { StudentBottomBar } from '../components/StudentBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { foundItemsService } from '../services/foundItemsService';
import { claimRequestsService } from '../services/claimRequestsService';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  FoundItem,
  getFoundItemCategoryLabel,
  getFoundItemStatusLabel,
} from '../types/foundItem';
import { ClaimRequest } from '../types/claimRequest';

// ============================================================
// ItemDetailScreen — Bulunan eşya detayı (öğrenci).
//
// Ne yapar:
// - Eşyanın fotoğrafını, kategorisini ve bulunma bilgilerini gösterir
// - Öğrencinin BU eşya için açtığı talebi de yükler:
//   talep varsa buton yerine talebin durumunu gösteren kart çıkar
//   (İnceleniyor / Onaylandı / Reddedildi ...)
// - Eşya teslim edilmiş veya arşivlenmişse yeni talep açtırmaz
//
// Kullandığı servisler: foundItemsService, claimRequestsService
// ============================================================

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ItemDetailRouteProp = RouteProp<RootStackParamList, 'ItemDetail'>;

/**
 * Öğrencinin talebinin durumuna göre alt kısımda gösterilecek
 * ikon, renk ve metni belirler.
 */
function getClaimView(claim: ClaimRequest) {
  switch (claim.status) {
    case 'PENDING':
      return {
        icon: 'time-outline' as const,
        color: colors.yeditepeBlue,
        tint: colors.blueTint12,
        title: 'Talebiniz İnceleniyor',
        message:
          'Güvenlik birimi talebinizi değerlendiriyor. Sonuç bildirim olarak iletilecek.',
      };

    case 'INFO_REQUESTED':
      return {
        icon: 'alert-circle-outline' as const,
        color: colors.warning,
        tint: colors.warningTint14,
        title: 'Ek Bilgi İstendi',
        message:
          claim.adminNote ||
          'Talebiniz için ek bilgi istendi. Lütfen güvenlik birimiyle iletişime geçin.',
      };

    case 'APPROVED':
      return {
        icon: 'checkmark-circle-outline' as const,
        color: colors.success,
        tint: colors.successTint12,
        title: 'Talebiniz Onaylandı',
        message:
          claim.adminNote ||
          'Eşyanızı güvenlik biriminden teslim alabilirsiniz.',
      };

    case 'REJECTED':
      return {
        icon: 'close-circle-outline' as const,
        color: colors.error,
        tint: colors.errorTint10,
        title: 'Talebiniz Reddedildi',
        message:
          claim.adminNote ||
          'Talebiniz güvenlik birimi tarafından uygun bulunmadı.',
      };

    case 'COMPLETED':
      return {
        icon: 'cube-outline' as const,
        color: colors.success,
        tint: colors.successTint12,
        title: 'Eşya Teslim Edildi',
        message: 'Bu eşya size teslim edilmiştir. İşlem tamamlandı.',
      };

    default:
      return {
        icon: 'information-circle-outline' as const,
        color: colors.textSecondary,
        tint: colors.surfaceLight,
        title: 'Talep Durumu',
        message: 'Talebinizin durumu güncelleniyor.',
      };
  }
}

export function ItemDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ItemDetailRouteProp>();
  const { token } = useAuth();
  const { itemId } = route.params;

  const [item, setItem] = useState<FoundItem | null>(null);
  // Öğrencinin BU eşya için daha önce açtığı talep (varsa).
  // Olmadan ekran, talep gönderilmemiş gibi görünüyordu.
  const [myClaim, setMyClaim] = useState<ClaimRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Talep oluşturma ekranından dönüldüğünde durum güncel görünsün diye
  // useEffect yerine useFocusEffect kullanılıyor.
  useFocusEffect(
    useCallback(() => {
      loadItem();
    }, [itemId, token])
  );

  async function loadItem() {
    try {
      const [data, myClaims] = await Promise.all([
        foundItemsService.getFoundItemById(itemId, token),
        claimRequestsService.getMyClaimRequests(token),
      ]);

      // Aynı eşya için birden fazla talep olabilir; en yenisini göster
      const claimsForItem = myClaims
        .filter(c => c.item?.id === itemId)
        .sort((a, b) => Number(b.id) - Number(a.id));
      setMyClaim(claimsForItem[0] ?? null);
      setItem(data);
    } catch (error) {
      console.error('Eşya detayı yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.yeditepeBlue} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Eşya bulunamadı</Text>
      </View>
    );
  }

  // Backend kuralı (ClaimRequestService): sadece WAITING_OWNER veya
  // CLAIM_REQUESTED durumundaki eşyalar için talep açılabilir.
  // Teslim edilmiş / arşivlenmiş eşyada buton gösterilmemeli.
  const canClaim =
    item.status === 'WAITING_OWNER' || item.status === 'CLAIM_REQUESTED';
  const claimView = myClaim ? getClaimView(myClaim) : null;

  return (
    <View style={styles.container}>
      <AppHeader title="İlan Detayı" showBack showNotification={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageCard}>
          {item.imageUrl ? (
            <ImageWithFallback
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.itemImage, { alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
            </View>
          )}

          <View style={styles.imageBadge}>
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.yeditepeBlue}
            />
            <Text style={styles.imageBadgeText}>
              {getFoundItemStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bulunan Eşya: {item.title}</Text>

          <View style={styles.infoList}>
            <InfoRow
              icon="document-text-outline"
              label="İlan Numarası:"
              value={`#${item.id}`}
            />

            <InfoRow
              icon="location-outline"
              label="Bulunduğu Yer:"
              value={item.location}
            />

            <InfoRow
              icon="calendar-outline"
              label="Bulunma Tarihi:"
              value={item.foundDate}
            />

            <InfoRow
              icon="pricetag-outline"
              label="Kategori:"
              value={getFoundItemCategoryLabel(item.category)}
            />

            <InfoRow
              icon="information-circle-outline"
              label="Durum:"
              value={getFoundItemStatusLabel(item.status)}
              isStatus
            />
          </View>
        </View>

        {item.description ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Açıklama</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
        ) : null}

        {canClaim ? (
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={colors.yeditepeBlue}
              style={styles.infoIcon}
            />

            <Text style={styles.infoText}>
              Eşyanın size ait olduğunu düşünüyorsanız teslim talebi
              oluşturabilirsiniz. Güvenlik birimi talebinizi inceleyecektir.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {myClaim ? (
          // Öğrencinin bu eşya için talebi var — buton yerine durum kartı
          <View style={[styles.claimStatusCard, { backgroundColor: claimView!.tint }]}>
            <View style={styles.claimStatusIcon}>
              <Ionicons name={claimView!.icon} size={26} color={claimView!.color} />
            </View>
            <View style={styles.claimStatusText}>
              <Text style={[styles.claimStatusTitle, { color: claimView!.color }]}>
                {claimView!.title}
              </Text>
              <Text style={styles.claimStatusMessage}>{claimView!.message}</Text>
            </View>
          </View>
        ) : canClaim ? (
          <Pressable
            style={styles.claimButton}
            onPress={() =>
              navigation.navigate('ClaimRequest', {
                itemId: item.id,
              })
            }
            accessibilityLabel="Bu eşya bana ait talebi oluştur"
          >
            <Ionicons
              name="hand-left-outline"
              size={19}
              color={colors.white}
            />
            <Text style={styles.claimButtonText}>Bu eşya bana ait</Text>
          </Pressable>
        ) : (
          // Eşya teslim edilmiş veya arşivlenmiş — talep açılamaz
          <View style={styles.claimStatusCard}>
            <View style={styles.claimStatusIcon}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={colors.textSecondary}
              />
            </View>
            <View style={styles.claimStatusText}>
              <Text style={styles.claimClosedTitle}>Talep Oluşturulamaz</Text>
              <Text style={styles.claimStatusMessage}>
                Bu eşya "{getFoundItemStatusLabel(item.status)}" durumunda
                olduğu için yeni teslim talebi alınmıyor.
              </Text>
            </View>
          </View>
        )}
      </View>

      <StudentBottomBar activeTab="listings" />
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
        <Text style={styles.infoValue} numberOfLines={2}>
          {value}
        </Text>
      )}
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
    paddingBottom: 40,
    gap: 16,
  },

  imageCard: {
    width: '100%',
    height: 230,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.surfaceDivider,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  itemImage: {
    width: '100%',
    height: '100%',
  },

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
    borderRadius: 22,
    padding: 18,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.yeditepeBlue,
    marginBottom: 14,
  },

  infoList: {
    gap: 11,
  },

  infoRow: {
    minHeight: 44,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight24,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  infoLabelBlock: {
    minWidth: 128,
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

  statusPill: {
    backgroundColor: colors.blueTint10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },

  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.yeditepeBlue,
  },

  descriptionText: {
    fontSize: 13.2,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  infoBox: {
    backgroundColor: colors.blueTint08,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.blueTint16,
  },

  infoIcon: {
    marginRight: 10,
    marginTop: 1,
  },

  infoText: {
    flex: 1,
    fontSize: 12.8,
    lineHeight: 19,
    color: colors.textPrimary,
  },

  footer: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight35,
  },

  claimButton: {
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  claimButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },

  // --- Talep durumu kartı (buton yerine gösterilir) ---
  claimStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceLight,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  claimStatusIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimStatusText: {
    flex: 1,
    gap: 3,
  },
  claimStatusTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  claimClosedTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  claimStatusMessage: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
    color: colors.textSecondary,
  },
});