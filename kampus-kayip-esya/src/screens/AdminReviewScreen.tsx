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
  CommonActions,
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
import { lostReportsService } from '../services/lostReportsService';
import { LostReport, getLostReportStatusLabel } from '../types/lostReport';
import { getFoundItemCategoryLabel } from '../types/foundItem';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AdminReviewRouteProp = RouteProp<RootStackParamList, 'AdminReview'>;

export function AdminReviewScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AdminReviewRouteProp>();
  const { token } = useAuth();

  const { reportId } = route.params;

  const [report, setReport] = useState<LostReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      const data = await lostReportsService.getLostReportById(reportId, token);
      setReport(data);
    } catch (error) {
      console.error('Bildiri yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove() {
    setIsProcessing(true);
    try {
      await lostReportsService.approveLostReport(
        reportId,
        'Bildiriniz onaylandı ve aktif kayıp bildirimleri arasına eklendi.',
        token
      );
      Alert.alert('Başarılı', 'Bildiri onaylandı.', [
        {
          text: 'Tamam',
          onPress: () =>
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'ActiveLostReports' }],
              })
            ),
        },
      ]);
    } catch (error: any) {
      const message = error?.message || 'Onaylama başarısız oldu.';
      Alert.alert('Hata', message);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject() {
    setIsProcessing(true);
    try {
      await lostReportsService.rejectLostReport(
        reportId,
        'Bildiriniz reddedildi.',
        token
      );
      Alert.alert('Başarılı', 'Bildiri reddedildi.', [
        {
          text: 'Tamam',
          onPress: () =>
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'PendingReports' }],
              })
            ),
        },
      ]);
    } catch (error: any) {
      const message = error?.message || 'Reddetme başarısız oldu.';
      Alert.alert('Hata', message);
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Bildiri İnceleme" showBack showNotification={false} />
        <ActivityIndicator
          size="large"
          color={colors.yeditepeBlue}
          style={{ marginTop: 40 }}
        />
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <AppHeader title="Bildiri İnceleme" showBack showNotification={false} />
        <Text style={styles.emptyText}>Bildiri bulunamadı</Text>
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Bildiri İnceleme" showBack showNotification={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusIconBox}>
            <Ionicons
              name="time-outline"
              size={34}
              color={colors.yeditepeBlue}
            />
          </View>

          <View style={styles.statusTextBlock}>
            <Text style={styles.statusTitle}>
              {getLostReportStatusLabel(report.status)}
            </Text>
            <Text style={styles.statusDescription}>
              Öğrencinin kayıp eşya bildirisi yayınlanmadan önce incelenmelidir.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bildiri Özeti</Text>

          <View style={styles.reportSummary}>
            <View style={styles.reportIconBox}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={31}
                color={colors.yeditepeBlue}
              />
            </View>

            <View style={styles.reportTextBlock}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportMeta}>
                {report.lostLocation} • {report.lostDate}
              </Text>

              <View style={styles.pendingBadge}>
                <Ionicons
                  name="time-outline"
                  size={13}
                  color={colors.yeditepeBlue}
                />
                <Text style={styles.pendingBadgeText}>
                  {getLostReportStatusLabel(report.status)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoList}>
            <InfoRow
              icon="person-outline"
              label="Öğrenci:"
              value={report.student?.fullName || 'Bilinmiyor'}
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
              label="Tarih:"
              value={report.lostDate}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Öğrenci Açıklaması</Text>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>İnceleme Notları</Text>

          <View style={styles.checkItem}>
            <View style={styles.checkIconBox}>
              <Ionicons
                name="checkmark"
                size={16}
                color={colors.yeditepeBlue}
              />
            </View>
            <Text style={styles.checkText}>
              Bildiri içeriği öğrencinin kayıp eşya beyanı olarak uygun.
            </Text>
          </View>

          <View style={styles.checkItem}>
            <View style={styles.checkIconBox}>
              <Ionicons
                name="checkmark"
                size={16}
                color={colors.yeditepeBlue}
              />
            </View>
            <Text style={styles.checkText}>
              Kategori ve kampüs alanı bilgileri kontrol edilebilir durumda.
            </Text>
          </View>

          <View style={styles.warningItem}>
            <View style={styles.warningIconBox}>
              <Ionicons
                name="alert-outline"
                size={16}
                color={colors.warning}
              />
            </View>
            <Text style={styles.warningText}>
              Fotoğraf veya ek açıklama yetersizse öğrenciden düzenleme
              istenebilir.
            </Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <View style={styles.noteIconBox}>
            <Ionicons
              name="information-circle-outline"
              size={26}
              color={colors.yeditepeBlue}
            />
          </View>
          <View style={styles.noteTextBlock}>
            <Text style={styles.noteTitle}>Admin Bilgilendirme</Text>
            <Text style={styles.noteText}>
              Onaylanan bildiri aktif kayıp bildirimleri listesine taşınır.
              Öğrenciden düzenleme istenirse bildiri yayınlanmaz ve öğrenciye
              bildirim gönderilir.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
        <Text style={styles.footerTitle}>İnceleme İşlemleri</Text>

        <View style={styles.buttonGroup}>
          <Pressable
            style={[styles.approveButton, isProcessing && styles.disabledButton]}
            onPress={handleApprove}
            disabled={isProcessing}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={colors.white}
            />
            <Text style={styles.primaryButtonText}>
              {isProcessing ? 'İşleniyor...' : 'Onayla'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.revisionButton, isProcessing && styles.disabledButton]}
            onPress={() =>
              navigation.navigate('RevisionRequest', { reportId: report.id })
            }
            disabled={isProcessing}
          >
            <Ionicons name="create-outline" size={18} color={colors.white} />
            <Text style={styles.primaryButtonText}>Düzenleme İste</Text>
          </Pressable>

          <Pressable
            style={[styles.rejectButton, isProcessing && styles.disabledButton]}
            onPress={handleReject}
            disabled={isProcessing}
          >
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={colors.white}
            />
            <Text style={styles.primaryButtonText}>Reddet</Text>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
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
    borderColor: 'rgba(34, 113, 196, 0.18)',
  },
  statusIconBox: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statusTextBlock: { flex: 1 },
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
  reportSummary: {
    backgroundColor: 'rgba(34, 113, 196, 0.08)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 113, 196, 0.14)',
  },
  reportIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  reportTextBlock: { flex: 1 },
  reportTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  reportMeta: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 13,
  },
  pendingBadgeText: {
    color: colors.yeditepeBlue,
    fontSize: 10.5,
    fontWeight: '800',
  },
  infoList: { gap: 11 },
  infoRow: {
    minHeight: 36,
    borderTopWidth: 1,
    borderTopColor: 'rgba(193, 198, 211, 0.24)',
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabelBlock: {
    minWidth: 130,
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
  descriptionText: {
    fontSize: 13.2,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  checkItem: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: '#F2F3FB',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkIconBox: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(34, 113, 196, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkText: {
    flex: 1,
    fontSize: 12.8,
    lineHeight: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  warningItem: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(217, 119, 6, 0.10)',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIconBox: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(217, 119, 6, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 12.8,
    lineHeight: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  noteCard: {
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
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noteTextBlock: { flex: 1 },
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
  footerActions: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(193, 198, 211, 0.35)',
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  buttonGroup: { gap: 6 },
  approveButton: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  revisionButton: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  rejectButton: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '800',
  },
});