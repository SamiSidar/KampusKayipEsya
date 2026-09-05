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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { StudentBottomBar } from '../components/StudentBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { lostReportsService } from '../services/lostReportsService';
import { LostReport, getLostReportStatusLabel } from '../types/lostReport';
import { getFoundItemCategoryLabel } from '../types/foundItem';
import { ImageWithFallback } from '../components/ImageWithFallback';

// ============================================================
// StudentReportDetailScreen — Öğrencinin bildiri detayı.
//
// Ne yapar:
// - Bildirinin durumunu ve varsa admin notunu gösterir
// - Eşleşen eşya bulunduysa o eşyaya giden bir bağlantı sunar
// - Admin düzeltme istediyse 'Düzenle' butonuyla bildiriyi güncellemeye izin verir
//
// Kullandığı servis: lostReportsService.getLostReportById()
// ============================================================

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type StudentReportDetailRouteProp = RouteProp<
  RootStackParamList,
  'StudentReportDetail'
>;

export function StudentReportDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<StudentReportDetailRouteProp>();
  const { token } = useAuth();

  const { reportId } = route.params;

  const [report, setReport] = useState<LostReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      const data = await lostReportsService.getLostReportById(reportId, token);
      setReport(data);
    } catch (error) {
      console.error('Bildiri detayı yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Bildiri Detayı" showBack showNotification={false} />
        <ActivityIndicator
          size="large"
          color={colors.yeditepeBlue}
          style={{ marginTop: 40 }}
        />
        <StudentBottomBar activeTab="reports" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <AppHeader title="Bildiri Detayı" showBack showNotification={false} />
        <Text style={styles.emptyText}>Bildiri bulunamadı</Text>
        <StudentBottomBar activeTab="reports" />
      </View>
    );
  }

  const hasMatch = report.status === 'MATCH_FOUND' && Boolean(report.matchedItem);
  const statusLabel = getLostReportStatusLabel(report.status);

  return (
    <View style={styles.container}>
      <AppHeader title="Bildiri Detayı" showBack showNotification={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Durum kartı */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconBox}>
            <Ionicons
              name={
                hasMatch
                  ? 'information-circle-outline'
                  : report.status === 'APPROVED'
                    ? 'checkmark-circle-outline'
                    : 'time-outline'
              }
              size={36}
              color={colors.yeditepeBlue}
            />
          </View>

          <View style={styles.statusTextBlock}>
            <Text style={styles.statusTitle}>{statusLabel}</Text>
            <Text style={styles.statusDescription}>
              {hasMatch
                ? 'Güvenliğe bildiriminize benzer bir eşya teslim edildi. Detayları inceleyerek teslim talebi oluşturabilirsiniz.'
                : 'Bildirinizin durumunu bu ekrandan takip edebilirsiniz.'}
            </Text>
          </View>
        </View>

        {/* Bildiri bilgileri */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bildiri Bilgileri</Text>

          <View style={styles.infoList}>
            <InfoRow
              icon="wallet-outline"
              label="Eşya Adı:"
              value={report.title}
              material
            />
            <InfoRow
              icon="pricetag-outline"
              label="Kategori:"
              value={getFoundItemCategoryLabel(report.category)}
            />
            <InfoRow
              icon="location-outline"
              label="Kaybolduğu Alan:"
              value={report.lostLocation}
            />
            <InfoRow
              icon="calendar-outline"
              label="Kaybolma Tarihi:"
              value={report.lostDate}
            />
            <InfoRow
              icon="information-circle-outline"
              label="Durum:"
              value={statusLabel}
              isStatus
            />
          </View>
        </View>

        {/* Açıklama */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Açıklama</Text>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>

        {/* Eşya Görseli */}
        {report.imageUrl ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Eşya Görseli</Text>
            <View style={styles.imageContainer}>
              <ImageWithFallback
                source={{ uri: report.imageUrl }}
                style={styles.reportImage}
                fallbackIconSize={48}
              />
            </View>
          </View>
        ) : null}

        {/* Eşleşme kartı */}
        {hasMatch && report.matchedItem ? (
          <View style={styles.matchCard}>
            <View style={styles.matchIconBox}>
              <MaterialCommunityIcons
                name="archive-search-outline"
                size={30}
                color={colors.yeditepeBlue}
              />
            </View>

            <View style={styles.matchTextBlock}>
              <Text style={styles.matchTitle}>Benzer Eşya Kaydı</Text>
              <Text style={styles.matchText}>
                Güvenlik tarafından kaydedilen bir eşya bu bildirinizle benzerlik
                gösteriyor.
              </Text>

              <View style={styles.matchInfoBox}>
                <InfoLine
                  icon="cube-outline"
                  label="Bulunan Eşya"
                  value={report.matchedItem.title}
                />
                <InfoLine
                  icon="location-outline"
                  label="Teslim Alan"
                  value={report.matchedItem.location}
                />
                <InfoLine
                  icon="calendar-outline"
                  label="Tarih"
                  value={report.matchedItem.foundDate}
                />
              </View>

              <Pressable
                style={styles.primaryButton}
                onPress={() =>
                  navigation.navigate('ItemDetail', {
                    itemId: report.matchedItem!.id,
                  })
                }
                accessibilityLabel="Benzer eşyayı gör"
              >
                <Text style={styles.primaryButtonText}>Benzer Eşyayı Gör</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Admin notu */}
        {report.adminNote ? (
          <View style={styles.adminNoteCard}>
            <View style={styles.noteIconBox}>
              <MaterialCommunityIcons
                name="note-text-outline"
                size={27}
                color={colors.yeditepeBlue}
              />
            </View>
            <View style={styles.noteTextBlock}>
              <Text style={styles.noteTitle}>Admin Notu</Text>
              <Text style={styles.noteText}>{report.adminNote}</Text>
            </View>
          </View>
        ) : null}

        {/* Düzenleme İsteği Kartı */}
        {report.status === 'REVISION_REQUESTED' && report.revisionNote ? (
          <View style={styles.revisionCard}>
            <View style={styles.revisionIconBox}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={28}
                color={colors.yeditepeBlue}
              />
            </View>
            <View style={styles.revisionTextBlock}>
              <Text style={styles.revisionTitle}>Düzenleme İsteği</Text>
              <Text style={styles.revisionDescription}>
                Admin bildirinizde bazı düzeltmeler yapmanızı istiyor:
              </Text>
              <View style={styles.revisionNoteBox}>
                <Text style={styles.revisionNoteText}>{report.revisionNote}</Text>
              </View>

              <Pressable
                style={styles.editButton}
                onPress={() =>
                  navigation.navigate('LostReport', {
                    reportId: report.id,
                  })
                }
                accessibilityLabel="Bildiriyi düzenle"
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={16}
                  color={colors.white}
                />
                <Text style={styles.editButtonText}>Bildiriyi Düzenle</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <StudentBottomBar activeTab="reports" />
    </View>
  );
}

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  isStatus?: boolean;
  material?: boolean;
};

function InfoRow({
  icon,
  label,
  value,
  isStatus = false,
  material = false,
}: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelBlock}>
        {material ? (
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={17}
            color={colors.textSecondary}
          />
        ) : (
          <Ionicons
            name={icon as keyof typeof Ionicons.glyphMap}
            size={17}
            color={colors.textSecondary}
          />
        )}
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

type InfoLineProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoLine({ icon, label, value }: InfoLineProps) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name={icon} size={14} color={colors.textSecondary} />
      <Text style={styles.infoLineLabel}>{label}:</Text>
      <Text style={styles.infoLineValue} numberOfLines={1}>
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 190,
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 40,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.blueTint18,
  },
  statusIconBox: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.blueTint10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statusTextBlock: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.yeditepeBlue,
    marginBottom: 5,
  },
  statusDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
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
  statusPill: {
    backgroundColor: colors.blueTint10,
    paddingHorizontal: 10,
    paddingVertical: 6, minHeight: 44,
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
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLight,
  },
  reportImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  matchCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.blueTint18,
  },
  matchIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.blueTint10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  matchTextBlock: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  matchText: {
    fontSize: 12.8,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  matchInfoBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 12,
    gap: 5,
    marginBottom: 12,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLineLabel: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  infoLineValue: {
    marginLeft: 4,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 21,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 13.5,
    fontWeight: '800',
  },
  adminNoteCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  noteIconBox: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.blueTint10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noteTextBlock: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  noteText: {
    fontSize: 12.8,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  revisionCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    borderWidth: 1.5,
    borderColor: colors.yeditepeBlue,
  },
  revisionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.blueTint10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  revisionTextBlock: {
    flex: 1,
  },
  revisionTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.yeditepeBlue,
    marginBottom: 5,
  },
  revisionDescription: {
    fontSize: 12.8,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  revisionNoteBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.yeditepeBlue,
  },
  revisionNoteText: {
    fontSize: 12.8,
    lineHeight: 19,
    color: colors.textPrimary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.yeditepeBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  editButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.white,
  },
});