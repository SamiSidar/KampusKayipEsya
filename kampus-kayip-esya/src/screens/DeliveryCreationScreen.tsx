import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
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
import { InlineError } from '../components/InlineError';
import { useDialog, DialogTone } from '../components/AppDialog';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { claimRequestsService } from '../services/claimRequestsService';
import { deliveriesService } from '../services/deliveriesService';
import { ClaimRequest, getClaimRequestStatusLabel } from '../types/claimRequest';
import { getFoundItemCategoryLabel } from '../types/foundItem';
import { CreateDeliveryRequest } from '../types/delivery';

// ============================================================
// DeliveryCreationScreen — Teslim kaydı oluşturur (admin).
//
// Ne yapar:
// - Onaylanmış bir teslim talebini fiziksel teslim kaydına dönüştürür
// - Teslimi yapan görevlinin adını ve tarihi alır
// - Kayıt sonrası eşya DELIVERED durumuna geçer ve talep kapanır
//
// Kullandığı servis: deliveriesService.createDelivery()
// ============================================================

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DeliveryCreationRouteProp = RouteProp<
  RootStackParamList,
  'DeliveryCreation'
>;

export function DeliveryCreationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DeliveryCreationRouteProp>();
  const { token } = useAuth();
  const { alert } = useDialog();

  const { claimId } = route.params;

  const [claim, setClaim] = useState<ClaimRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [recordedByName, setRecordedByName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminNote, setAdminNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadClaim();
  }, []);

  async function loadClaim() {
    try {
      const data = await claimRequestsService.getClaimRequestById(claimId, token);
      setClaim(data);
    } catch (error) {
      console.error('Talep detayı yüklenemedi:', error);
      setErrorMessage('Talep bilgileri yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }

  // Uygulama içi diyalog. Kullanıcı pencereyi kapatana kadar bekler,
  // sonra varsa onOk callback'ini çalıştırır (eski davranışla aynı).
  async function showAlert(
    title: string,
    message: string,
    onOk?: () => void,
    tone: DialogTone = 'success'
  ) {
    await alert({ title, message, tone });
    if (onOk) onOk();
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!recordedByName.trim()) {
      newErrors.recordedByName = 'Teslim kaydını yapan kişi adı gerekli';
    }

    if (!deliveryDate.trim()) {
      newErrors.deliveryDate = 'Teslim tarihi gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm() || !claim) return;

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      // Build combined note with recorder info and user's note
      const combinedNote = `Teslim kaydı: ${recordedByName.trim()} tarafından ${deliveryDate}'de kaydedildi${
        adminNote.trim() ? `. Not: ${adminNote.trim()}` : ''
      }`;

      const payload: CreateDeliveryRequest = {
        itemId: claim.item.id,
        claimId: claim.id,
        deliveredToName: claim.student.fullName, // Auto-filled with student name
        deliveredToStudentNumber: claim.student.id?.toString(), // Student number if available
        adminNote: combinedNote,
      };

      await deliveriesService.createDelivery(payload, token);
      showAlert('Başarılı', 'Teslim kaydı oluşturuldu.', () => {
        // Eşya artık DELIVERED durumunda, yani "Sahibi Bekleyen" listesinde
        // değil. Kullanıcıyı kaydın gerçekten göründüğü listeye götür.
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'DeliveredItems' }],
          })
        );
      });
    } catch (error: any) {
      setErrorMessage(error?.message || 'Teslim kaydı oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Eşyayı Teslim Et" showBack showNotification={false} />
        <ActivityIndicator size="large" color={colors.yeditepeBlue} style={{ marginTop: 40 }} />
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={styles.container}>
        <AppHeader title="Eşyayı Teslim Et" showBack showNotification={false} />
        <Text style={styles.emptyText}>Talep bulunamadı</Text>
        <View style={{ paddingHorizontal: 16 }}>
          <InlineError message={errorMessage} />
        </View>
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Eşyayı Teslim Et" showBack showNotification={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconBox}>
            <Ionicons name="checkmark-circle" size={35} color={colors.yeditepeBlue} />
          </View>
          <View style={styles.statusTextBlock}>
            <Text style={styles.statusTitle}>
              {getClaimRequestStatusLabel(claim.status)}
            </Text>
            <Text style={styles.statusDescription}>
              Eşyayı öğrenciye teslim et ve kaydı sisteme gir.
            </Text>
          </View>
        </View>

        {/* Item Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Teslim Edilecek Eşya</Text>

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
                {claim.item.location} • {getFoundItemCategoryLabel(claim.item.category)}
              </Text>
            </View>
          </View>

          <View style={styles.infoList}>
            <InfoRow icon="location-outline" label="Bulunduğu Yer:" value={claim.item.location} />
            {claim.item.storageLocation ? (
              <InfoRow icon="archive-outline" label="Depolama Yeri:" value={claim.item.storageLocation} />
            ) : null}
          </View>
        </View>

        {/* Student Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Teslim Alan Öğrenci</Text>

          <View style={styles.studentCard}>
            <View style={styles.studentIconBox}>
              <Ionicons name="person-outline" size={29} color={colors.yeditepeBlue} />
            </View>
            <View style={styles.studentTextBlock}>
              <Text style={styles.studentName}>{claim.student.fullName}</Text>
              <Text style={styles.studentMeta}>{claim.student.email}</Text>
            </View>
          </View>

          <View style={styles.infoList}>
            <InfoRow icon="person-outline" label="Ad Soyad:" value={claim.student.fullName} />
            <InfoRow icon="mail-outline" label="İletişim:" value={claim.student.email} />
          </View>
        </View>

        {/* Delivery Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Teslim Kaydı</Text>

          {/* Recorded By Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Teslim Kaydını Yapan Kişi Adı *</Text>
            <View style={[styles.inputContainer, errors.recordedByName && styles.inputError]}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Adı soyadı girin"
                placeholderTextColor={colors.textSecondary}
                value={recordedByName}
                onChangeText={setRecordedByName}
                editable={!isSubmitting}
                maxLength={100}
              />
            </View>
            {errors.recordedByName && (
              <Text style={styles.errorText}>{errors.recordedByName}</Text>
            )}
          </View>

          {/* Delivery Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Teslim Tarihi *</Text>
            <View style={[styles.inputContainer, errors.deliveryDate && styles.inputError]}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                value={deliveryDate}
                onChangeText={setDeliveryDate}
                editable={!isSubmitting}
                maxLength={10}
              />
            </View>
            {errors.deliveryDate && (
              <Text style={styles.errorText}>{errors.deliveryDate}</Text>
            )}
          </View>

          {/* Admin Note */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ek Not</Text>
            <View style={[styles.textAreaContainer, { minHeight: 100 }]}>
              <TextInput
                style={styles.textArea}
                placeholder="Teslim işlemi hakkında notlar (İsteğe bağlı)"
                placeholderTextColor={colors.textSecondary}
                value={adminNote}
                onChangeText={setAdminNote}
                editable={!isSubmitting}
                maxLength={500}
                multiline
                numberOfLines={4}
              />
            </View>
            <Text style={styles.charCount}>
              {adminNote.length}/500
            </Text>
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteIconBox}>
            <Ionicons name="information-circle-outline" size={25} color={colors.yeditepeBlue} />
          </View>
          <View style={styles.noteTextBlock}>
            <Text style={styles.noteTitle}>Teslim Süreci</Text>
            <Text style={styles.noteText}>
              Bu kaydı oluşturduğunuzda:{'\n'}
              • Eşya "Teslim Edilenler" listesine eklenecek{'\n'}
              • İlgili talep kapatılacak{'\n'}
              • Öğrenciye bildirim gönderilecek
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
        <Pressable
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityState={{ disabled: isSubmitting }}
          accessibilityLabel="Eşyayı teslim et"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={18} color={colors.white} />
              <Text style={styles.submitButtonText}>Eşyayı Teslim Et</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[styles.cancelButton, isSubmitting && styles.disabledButton]}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
          accessibilityState={{ disabled: isSubmitting }}
          accessibilityLabel="İptal et"
        >
          <Ionicons name="close-circle-outline" size={18} color={colors.yeditepeBlue} />
          <Text style={styles.cancelButtonText}>İptal Et</Text>
        </Pressable>

        <InlineError message={errorMessage} />
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

  // Status Card
  statusCard: {
    backgroundColor: colors.card, borderRadius: 22, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: colors.black, shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 4,
    borderWidth: 1, borderColor: colors.blueTint18,
  },
  statusIconBox: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: colors.blueTint10,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  statusTextBlock: { flex: 1 },
  statusTitle: { fontSize: 17, fontWeight: '800', color: colors.yeditepeBlue, marginBottom: 5 },
  statusDescription: { fontSize: 12.5, lineHeight: 18, color: colors.textSecondary },

  // Cards
  card: {
    backgroundColor: colors.card, borderRadius: 22, padding: 18,
    shadowColor: colors.black, shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.yeditepeBlue, marginBottom: 14 },

  // Item Summary
  itemSummaryCard: {
    backgroundColor: colors.blueTint08, borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: colors.blueTint14,
  },
  itemIconBox: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', marginRight: 13,
  },
  itemTextBlock: { flex: 1 },
  itemTitle: { fontSize: 15.5, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  itemMeta: { fontSize: 12.5, color: colors.textSecondary },

  // Student Card
  studentCard: {
    backgroundColor: colors.blueTint08, borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: colors.blueTint14,
  },
  studentIconBox: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', marginRight: 13,
  },
  studentTextBlock: { flex: 1 },
  studentName: { fontSize: 15.5, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  studentMeta: { fontSize: 12.5, color: colors.textSecondary },

  // Info List
  infoList: { gap: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
  },
  infoLabelBlock: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, flex: 1, textAlign: 'right' },

  // Form
  formGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background, borderRadius: 14, paddingHorizontal: 14,
    borderWidth: 1, borderColor: colors.border, minHeight: 50,
  },
  inputError: { borderColor: colors.error },
  inputIcon: { marginRight: 8 },
  textInput: {
    flex: 1, fontSize: 14, color: colors.textPrimary,
  },
  textAreaContainer: {
    backgroundColor: colors.background, borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10,
  },
  textArea: {
    fontSize: 14, color: colors.textPrimary, flex: 1,
  },
  charCount: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  errorText: { fontSize: 12, color: colors.error, marginTop: 6 },

  // Note Card
  noteCard: {
    backgroundColor: colors.blueTint08, borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderWidth: 1, borderColor: colors.blueTint14,
  },
  noteIconBox: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  noteTextBlock: { flex: 1 },
  noteTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  noteText: { fontSize: 12.5, lineHeight: 18, color: colors.textSecondary },

  // Footer
  footerActions: {
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
    backgroundColor: colors.background,
  },
  submitButton: {
    backgroundColor: colors.yeditepeBlue, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8,
  },
  cancelButton: {
    backgroundColor: colors.background, borderRadius: 14, borderWidth: 2,
    borderColor: colors.yeditepeBlue, paddingVertical: 12, alignItems: 'center',
    justifyContent: 'center', flexDirection: 'row', gap: 8,
  },
  submitButtonText: { fontSize: 14, fontWeight: '700', color: colors.white },
  cancelButtonText: { fontSize: 14, fontWeight: '700', color: colors.yeditepeBlue },
  disabledButton: { opacity: 0.5 },
});
