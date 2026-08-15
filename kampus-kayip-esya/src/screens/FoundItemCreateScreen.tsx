import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { AdminBottomBar } from '../components/AdminBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { foundItemsService } from '../services/foundItemsService';
import { uploadService } from '../services/uploadService';
import { FoundItemCategory } from '../types/foundItem';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const categories: { label: string; value: FoundItemCategory }[] = [
  { label: 'Cüzdan', value: 'WALLET' },
  { label: 'Anahtar', value: 'KEY' },
  { label: 'Kimlik / Kart', value: 'CARD' },
  { label: 'Elektronik', value: 'ELECTRONIC' },
  { label: 'Çanta', value: 'BAG' },
  { label: 'Aksesuar', value: 'ACCESSORY' },
  { label: 'Diğer', value: 'OTHER' },
];

export function FoundItemCreateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FoundItemCategory | ''>('');
  const [location, setLocation] = useState('');
  const [foundDate, setFoundDate] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  async function pickImage(useCamera: boolean) {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Kamera kullanabilmek için izin vermeniz gerekiyor.');
        return;
      }
    } else {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Galeriye erişebilmek için izin vermeniz gerekiyor.');
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

  function showImageOptions() {
    if (Platform.OS === 'web') {
      pickImage(false);
    } else {
      Alert.alert('Fotoğraf Ekle', 'Fotoğraf kaynağını seçin', [
        { text: 'Kamera', onPress: () => pickImage(true) },
        { text: 'Galeri', onPress: () => pickImage(false) },
        { text: 'İptal', style: 'cancel' },
      ]);
    }
  }

  async function handleSave() {
    if (!title.trim() || !category || !location.trim()) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun (Eşya Adı, Kategori, Alan).');
      return;
    }

    try {
      setIsSubmitting(true);

      let uploadedImageUrl: string | undefined;
      if (imageUri) {
        uploadedImageUrl = await uploadService.uploadImage(imageUri, token);
      }

      await foundItemsService.createFoundItem(
        {
          title: title.trim(),
          category: category as FoundItemCategory,
          location: location.trim(),
          foundDate: foundDate || new Date().toISOString().split('T')[0],
          description: description.trim() || undefined,
          storageLocation: storageLocation.trim() || undefined,
          imageUrl: uploadedImageUrl,
        },
        token
      );

      Alert.alert('Başarılı', 'Eşya kaydedildi.', [
        {
          text: 'Tamam',
          onPress: () =>
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'WaitingOwnerItems' }],
              })
            ),
        },
      ]);
    } catch (error: any) {
      const message = error?.message || 'Eşya kaydedilemedi. Tekrar deneyin.';
      Alert.alert('Hata', message);
      console.error('Eşya kayıt hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedCategoryLabel =
    categories.find(c => c.value === category)?.label || '';

  return (
    <View style={styles.container}>
      <AppHeader
        title="Bulunan Eşya Kaydet"
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
              placeholder="Örn: Mavi Cüzdan"
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
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        category === cat.value && styles.categoryItemTextActive,
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
            <Text style={styles.label}>Teslim Alındığı Kampüs Alanı</Text>
            <TextInput
              placeholder="Örn: Kütüphane Girişi"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Teslim Alınma Tarihi</Text>
            <TextInput
              placeholder="Örn: 2026-08-04"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              value={foundDate}
              onChangeText={setFoundDate}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Depolama Yeri</Text>
            <TextInput
              placeholder="Örn: Güvenlik Ofisi / Dolap 2 / Raf B"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              value={storageLocation}
              onChangeText={setStorageLocation}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              placeholder="Eşya hakkında kısa açıklama yazın..."
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
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              <View style={styles.imageActions}>
                <Pressable style={styles.changePhotoButton} onPress={showImageOptions}>
                  <Ionicons name="camera-outline" size={16} color={colors.yeditepeBlue} />
                  <Text style={styles.changePhotoText}>Değiştir</Text>
                </Pressable>
                <Pressable style={styles.removePhotoButton} onPress={() => setImageUri(null)}>
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                  <Text style={styles.removePhotoText}>Kaldır</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.photoButton} onPress={showImageOptions}>
              <Ionicons
                name="camera-outline"
                size={20}
                color={colors.yeditepeBlue}
              />
              <Text style={styles.photoButtonText}>Fotoğraf Ekle</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Kaydet</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <AdminBottomBar activeTab="plus" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 185 },
  formCard: {
    backgroundColor: colors.card, borderRadius: 22, padding: 20,
    shadowColor: colors.black, shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 }, elevation: 5,
  },
  fieldGroup: { marginBottom: 17 },
  label: { fontSize: 13.5, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  input: {
    minHeight: 50, borderWidth: 1, borderColor: 'rgba(193, 198, 211, 0.85)',
    borderRadius: 15, backgroundColor: colors.white, paddingHorizontal: 15,
    fontSize: 14, color: colors.textPrimary, outlineStyle: 'none' as any,
  },
  textArea: { height: 112, paddingTop: 13 },
  selectBox: {
    minHeight: 50, borderWidth: 1, borderColor: 'rgba(193, 198, 211, 0.85)',
    borderRadius: 15, backgroundColor: colors.white, paddingHorizontal: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  selectText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  categoryList: {
    marginTop: 8, borderWidth: 1, borderColor: 'rgba(193, 198, 211, 0.85)',
    borderRadius: 15, backgroundColor: colors.white, overflow: 'hidden',
  },
  categoryItem: {
    paddingHorizontal: 15, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(193, 198, 211, 0.3)',
  },
  categoryItemActive: { backgroundColor: 'rgba(34, 113, 196, 0.10)' },
  categoryItemText: { fontSize: 14, color: colors.textPrimary },
  categoryItemTextActive: { color: colors.yeditepeBlue, fontWeight: '700' },
  imagePreviewContainer: {
    marginTop: 4, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(193, 198, 211, 0.5)',
  },
  imagePreview: {
    width: '100%', height: 200, borderTopLeftRadius: 15, borderTopRightRadius: 15,
  },
  imageActions: {
    flexDirection: 'row', justifyContent: 'center', gap: 16,
    paddingVertical: 10, backgroundColor: colors.white,
  },
  changePhotoButton: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
  },
  changePhotoText: { fontSize: 13, fontWeight: '700', color: colors.yeditepeBlue },
  removePhotoButton: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(211, 47, 47, 0.08)',
  },
  removePhotoText: { fontSize: 13, fontWeight: '700', color: colors.error },
  photoButton: {
    minHeight: 50, borderWidth: 1.5, borderColor: colors.yeditepeBlue,
    borderRadius: 25, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 4,
  },
  photoButtonText: { color: colors.yeditepeBlue, fontSize: 14, fontWeight: '800' },
  submitButton: {
    minHeight: 52, borderRadius: 26, backgroundColor: colors.yeditepeBlue,
    alignItems: 'center', justifyContent: 'center', marginTop: 14,
    shadowColor: colors.yeditepeBlue, shadowOpacity: 0.22, shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 }, elevation: 5,
  },
  submitButtonText: { color: colors.white, fontSize: 15, fontWeight: '800' },
});
