import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { StudentBottomBar } from '../components/StudentBottomBar';
import { InlineError } from '../components/InlineError';
import { useDialog } from '../components/AppDialog';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { lostReportsService } from '../services/lostReportsService';
import { uploadService } from '../services/uploadService';
import { FoundItemCategory } from '../types/foundItem';
import { ImageWithFallback } from '../components/ImageWithFallback';

// ============================================================
// LostReportScreen — Kayıp eşya bildirisi (öğrenci).
//
// İki modda çalışır:
// - Parametresiz açılırsa YENİ bildiri oluşturur
// - reportId parametresiyle açılırsa mevcut bildiriyi DÜZENLER
//   (admin düzeltme istediğinde bu mod kullanılır)
//
// Bildiri gönderildikten sonra admin onayına düşer, onaylanana kadar
// aktif listede görünmez.
//
// Kullandığı servisler: lostReportsService, uploadService
// ============================================================

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type LostReportRouteProp = RouteProp<RootStackParamList, 'LostReport'>;

const categories: { label: string; value: FoundItemCategory }[] = [
  { label: 'Cüzdan', value: 'WALLET' },
  { label: 'Anahtar', value: 'KEY' },
  { label: 'Kimlik / Kart', value: 'CARD' },
  { label: 'Elektronik', value: 'ELECTRONIC' },
  { label: 'Çanta', value: 'BAG' },
  { label: 'Aksesuar', value: 'ACCESSORY' },
  { label: 'Diğer', value: 'OTHER' },
];

export function LostReportScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<LostReportRouteProp>();
  const { token } = useAuth();
  const { alert, choose } = useDialog();

  const reportId = route.params?.reportId;
  const isEditMode = !!reportId;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FoundItemCategory | ''>('');
  const [lostLocation, setLostLocation] = useState('');
  const [lostDate, setLostDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [showCategories, setShowCategories] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Edit mode'da bildiriyi yükle
  useEffect(() => {
    if (isEditMode && reportId) {
      loadReport();
    }
  }, [isEditMode, reportId]);

  async function loadReport() {
    try {
      const data = await lostReportsService.getLostReportById(reportId!, token);
      setTitle(data.title);
      setCategory(data.category);
      setLostLocation(data.lostLocation);
      setLostDate(data.lostDate);
      setDescription(data.description);
      if (data.imageUrl) {
        setImageUri(data.imageUrl);
      }
    } catch (error) {
      console.error('Bildiri yüklenemedi:', error);
      await alert({
        title: 'Bildiri Yüklenemedi',
        message: 'Bildiri bilgileri getirilemedi. Lütfen tekrar deneyin.',
        tone: 'danger',
      });
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }

  async function pickImage(useCamera: boolean) {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Kamera kullanabilmek için izin vermeniz gerekiyor.');
        return;
      }
    } else {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          setErrorMessage('Galeriye erişebilmek için izin vermeniz gerekiyor.');
          return;
        }
      }
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function showImageOptions() {
    const source = await choose({
      title: 'Fotoğraf Ekle',
      message: 'Fotoğraf kaynağını seçin',
      tone: 'info',
      actions: [
        { label: 'Kamera', value: 'camera' },
        { label: 'Galeri', value: 'library' },
        { label: 'İptal', value: 'cancel', style: 'cancel' },
      ],
    });

    if (source === 'camera') pickImage(true);
    else if (source === 'library') pickImage(false);
  }

  async function handleSubmit() {
    if (
      !title.trim() ||
      !category ||
      !lostLocation.trim() ||
      !description.trim()
    ) {
      setErrorMessage('Lütfen tüm alanları doldurun.');
      return;
    }

    setErrorMessage('');

    try {
      setIsSubmitting(true);

      // Fotoğraf varsa ve yeni yüklenirse, önce yükle
      let uploadedImageUrl: string | undefined;
      if (imageUri && !imageUri.startsWith('http')) {
        uploadedImageUrl = await uploadService.uploadImage(imageUri, token);
      } else if (imageUri && imageUri.startsWith('http')) {
        // Zaten URL ise olduğu gibi kullan
        uploadedImageUrl = imageUri;
      }

      const payload = {
        title: title.trim(),
        category: category as FoundItemCategory,
        lostLocation: lostLocation.trim(),
        lostDate: (() => {
          const parts = (lostDate || new Date().toISOString().split('T')[0]).split('-');
          if (parts.length === 3) {
            return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          }
          return lostDate;
        })(),
        description: description.trim(),
        ...(uploadedImageUrl && { imageUrl: uploadedImageUrl }),
      };

      if (isEditMode && reportId) {
        // Edit mode — bildiriyi güncelle
        await lostReportsService.updateLostReport(reportId, payload, token);
        await alert({
          title: 'Başarılı',
          message: 'Bildiriniz güncellendi. İncelemeye gönderildi.',
          tone: 'success',
        });
      } else {
        // Create mode — yeni bildiri oluştur
        await lostReportsService.createLostReport(payload, token);
        await alert({
          title: 'Başarılı',
          message: 'Bildiriniz gönderildi.',
          tone: 'success',
        });
      }

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Success', params: { from: 'report' } }],
        })
      );
    } catch (error: any) {
      setErrorMessage(error?.message || 'İşlem başarısız. Tekrar deneyin.');
      console.error('Bildiri hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedCategoryLabel =
    categories.find(c => c.value === category)?.label || '';

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader
          title="Bildiri Düzenle"
          showBack
          showNotification={false}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.yeditepeBlue} />
        </View>
        <StudentBottomBar activeTab="home" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title={isEditMode ? 'Bildiri Düzenle' : 'Kayıp Eşya Bildir'}
        showBack
        showNotification={false}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Eşya Adı</Text>
            <TextInput
              placeholder="Örn: Siyah Cüzdan"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Kategori</Text>
            <Pressable
              style={styles.selectBox}
              onPress={() => setShowCategories(!showCategories)}
              accessibilityLabel="Kategori seçin"
            >
              <Text
                style={[
                  styles.selectText,
                  category ? { color: colors.textPrimary } : {},
                ]}
              >
                {selectedCategoryLabel || 'Kategori seçin'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={19}
                color={colors.textSecondary}
              />
            </Pressable>

            {showCategories ? (
              <View style={styles.categoryList}>
                {categories.map(cat => (
                  <Pressable
                    key={cat.value}
                    style={[
                      styles.categoryItem,
                      category === cat.value && styles.categoryItemActive,
                    ]}
                    onPress={() => {
                      setCategory(cat.value);
                      setShowCategories(false);
                    }}
                    accessibilityLabel={`${cat.label} seç`}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        category === cat.value &&
                          styles.categoryItemTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Kaybolduğu Kampüs Alanı</Text>
            <TextInput
              placeholder="Örn: Kütüphane Girişi"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              value={lostLocation}
              onChangeText={setLostLocation}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Kaybolma Tarihi</Text>
            <TextInput
              placeholder="Örn: 2026-08-04"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              value={lostDate}
              onChangeText={setLostDate}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              placeholder="Eşyanız hakkında kısa açıklama yazın..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <ImageWithFallback source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              <View style={styles.imageActions}>
                <Pressable style={styles.changePhotoButton} onPress={showImageOptions} accessibilityLabel="Fotoğrafı değiştir">
                  <Ionicons name="camera-outline" size={16} color={colors.yeditepeBlue} />
                  <Text style={styles.changePhotoText}>Değiştir</Text>
                </Pressable>
                <Pressable style={styles.removePhotoButton} onPress={() => setImageUri(null)} accessibilityLabel="Fotoğrafı kaldır">
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                  <Text style={styles.removePhotoText}>Kaldır</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.photoButton} onPress={showImageOptions} accessibilityLabel="Fotoğraf ekle">
              <Ionicons
                name="camera-outline"
                size={20}
                color={colors.yeditepeBlue}
              />
              <Text style={styles.photoButtonText}>Fotoğraf Ekle</Text>
            </Pressable>
          )}

          <Pressable
            style={[
              styles.submitButton,
              isSubmitting && { opacity: 0.7 },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityState={{ disabled: isSubmitting }}
            accessibilityLabel={isEditMode ? 'Bildiriyi güncelle' : 'Bildirimi gönder'}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Düzenlemeleri Gönder' : 'Bildirimi Gönder'}
              </Text>
            )}
          </Pressable>

          <InlineError message={errorMessage} />
        </View>
      </ScrollView>

      <StudentBottomBar activeTab="home" />
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
    paddingBottom: 170,
  },

  formCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 20,
    shadowColor: colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  fieldGroup: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.borderLight85,
    borderRadius: 15,
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.textPrimary,
    outlineStyle: 'none' as any,
  },

  textArea: {
    height: 120,
    paddingTop: 13,
  },

  selectBox: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.borderLight85,
    borderRadius: 15,
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  categoryList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderLight85,
    borderRadius: 15,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },

  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight30,
  },

  categoryItemActive: {
    backgroundColor: colors.blueTint10,
  },

  categoryItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },

  categoryItemTextActive: {
    color: colors.yeditepeBlue,
    fontWeight: '700',
  },

  imagePreviewContainer: {
    marginTop: 4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight50,
  },

  imagePreview: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },

  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },

  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.blueTint10,
  },

  changePhotoText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.yeditepeBlue,
  },

  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.errorTint08,
  },

  removePhotoText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.error,
  },

  photoButton: {
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: colors.yeditepeBlue,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },

  photoButtonText: {
    color: colors.yeditepeBlue,
    fontSize: 14,
    fontWeight: '800',
  },

  submitButton: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  submitButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
