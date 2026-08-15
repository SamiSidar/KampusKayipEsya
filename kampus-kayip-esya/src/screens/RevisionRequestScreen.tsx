import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
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
type RevisionRequestRouteProp = RouteProp<RootStackParamList, 'RevisionRequest'>;

const checklistItems = [
  'Fotoğraf daha net olmalı',
  'Kaybolduğu alan belirtilmeli',
  'Açıklama daha detaylı yazılmalı',
  'Kategori kontrol edilmeli',
];

export function RevisionRequestScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RevisionRequestRouteProp>();
  const { token } = useAuth();

  const { reportId } = route.params;

  const [report, setReport] = useState<LostReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');

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

  async function handleSubmit() {
    if (!revisionNote.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir düzenleme notu yazın.');
      return;
    }

    setIsProcessing(true);
    try {
      await lostReportsService.requestRevision(reportId, revisionNote, token);
      Alert.alert('Başarılı', 'Düzenleme isteği gönderildi.', [
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
      Alert.alert('Hata', error?.message || 'İşlem başarısız.');
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Düzenleme İste" showBack showNotification={false} />
        <ActivityIndicator size="large" color={colors.yeditepeBlue} style={{ marginTop: 40 }} />
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <AppHeader title="Düzenleme İste" showBack showNotification={false} />
        <Text style={styles.emptyText}>Bildiri bulunamadı</Text>
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Düzenleme İste" showBack showNotification={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusIconBox}>
            <Ionicons name="create-outline" size={34} color={colors.warning} />
          </View>
          <View style={styles.statusTextBlock}>
            <Text style={styles.statusTitle}>Eksik Bilgi Talebi</Text>
            <Text style={styles.statusDescription}>
              Öğrenciden bildiriyi düzeltmesini veya eksik bilgileri tamamlamasını isteyebilirsiniz.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bildiri Özeti</Text>

          <View style={styles.reportSummary}>
            <View style={styles.reportIconBox}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={30} color={colors.yeditepeBlue} />
            </View>
            <View style={styles.reportTextBlock}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportMeta}>
                {report.lostLocation} • {report.lostDate}
              </Text>
              <View style={styles.pendingBadge}>
                <Ionicons name="time-outline" size={13} color={colors.yeditepeBlue} />
                <Text style={styles.pendingBadgeText}>
                  {getLostReportStatusLabel(report.status)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoList}>
            <InfoRow icon="person-outline" label="Öğrenci:" value={report.student?.fullName || 'Bilinmiyor'} />
            <InfoRow icon="pricetag-outline" label="Kategori:" value={getFoundItemCategoryLabel(report.category)} />
            <InfoRow icon="location-outline" label="Alan:" value={report.lostLocation} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Düzenleme Nedeni</Text>
          <View style={styles.checklist}>
            {checklistItems.map(item => (
              <Pressable key={item} style={styles.checkItem}>
                <View style={styles.checkBox}>
                  <Ionicons name="checkmark" size={15} color={colors.yeditepeBlue} />
                </View>
                <Text style={styles.checkText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Öğrenciye Not</Text>
          <TextInput
            placeholder="Öğrenciye gönderilecek açıklamayı yazın..."
            placeholderTextColor={colors.textSecondary}
            style={styles.textArea}
            multiline
            textAlignVertical="top"
            value={revisionNote}
            onChangeText={setRevisionNote}
          />
          <Text style={styles.helperText}>
            Bu not öğrenciye bildiri detayı ekranında gösterilecektir.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
        <Pressable
          style={[styles.submitButton, isProcessing && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isProcessing}
        >
          <Ionicons name="send-outline" size={18} color={colors.white} />
          <Text style={styles.submitButtonText}>
            {isProcessing ? 'Gönderiliyor...' : 'Düzenleme İsteğini Gönder'}
          </Text>
        </Pressable>
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
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 24, gap: 16 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, fontSize: 14, marginTop: 40 },
  statusCard: {
    backgroundColor: colors.card, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center',
    shadowColor: colors.black, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4,
    borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.18)',
  },
  statusIconBox: {
    width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(217, 119, 6, 0.12)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  statusTextBlock: { flex: 1 },
  statusTitle: { fontSize: 17, fontWeight: '800', color: colors.warning, marginBottom: 5 },
  statusDescription: { fontSize: 12.5, lineHeight: 18, color: colors.textSecondary },
  card: {
    backgroundColor: colors.card, borderRadius: 22, padding: 18,
    shadowColor: colors.black, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.yeditepeBlue, marginBottom: 14 },
  reportSummary: {
    backgroundColor: 'rgba(34, 113, 196, 0.08)', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center',
    marginBottom: 14, borderWidth: 1, borderColor: 'rgba(34, 113, 196, 0.14)',
  },
  reportIconBox: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', marginRight: 13,
  },
  reportTextBlock: { flex: 1 },
  reportTitle: { fontSize: 15.5, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  reportMeta: { fontSize: 12.5, color: colors.textSecondary, marginBottom: 8 },
  pendingBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(34, 113, 196, 0.10)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 13,
  },
  pendingBadgeText: { color: colors.yeditepeBlue, fontSize: 10.5, fontWeight: '800' },
  infoList: { gap: 11 },
  infoRow: {
    minHeight: 36, borderTopWidth: 1, borderTopColor: 'rgba(193, 198, 211, 0.24)', paddingTop: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  infoLabelBlock: { minWidth: 118, flexDirection: 'row', alignItems: 'center', gap: 7 },
  infoLabel: { fontSize: 12.5, fontWeight: '700', color: colors.textSecondary },
  infoValue: { flex: 1, textAlign: 'right', fontSize: 12.8, fontWeight: '700', color: colors.textPrimary, lineHeight: 18 },
  checklist: { gap: 10 },
  checkItem: {
    minHeight: 44, borderRadius: 16, backgroundColor: '#F2F3FB', paddingHorizontal: 13,
    flexDirection: 'row', alignItems: 'center',
  },
  checkBox: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(34, 113, 196, 0.12)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  checkText: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  textArea: {
    minHeight: 130, borderWidth: 1, borderColor: 'rgba(193, 198, 211, 0.85)', borderRadius: 16,
    backgroundColor: colors.white, paddingHorizontal: 15, paddingTop: 13, fontSize: 14, lineHeight: 20,
    color: colors.textPrimary, outlineStyle: 'none' as any,
  },
  helperText: { marginTop: 10, fontSize: 11.5, lineHeight: 17, color: colors.textSecondary },
  footerActions: {
    backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(193, 198, 211, 0.35)',
  },
  submitButton: {
    minHeight: 44, borderRadius: 22, backgroundColor: colors.warning,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7,
  },
  disabledButton: { opacity: 0.6 },
  submitButtonText: { color: colors.white, fontSize: 13.5, fontWeight: '800' },
});
