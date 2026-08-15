import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CommonActions,
  RouteProp,
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
import { FoundItem, getFoundItemStatusLabel } from '../types/foundItem';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ClaimRequestRouteProp = RouteProp<RootStackParamList, 'ClaimRequest'>;

export function ClaimRequestScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ClaimRequestRouteProp>();
  const { token } = useAuth();
  const { itemId } = route.params;

  const [item, setItem] = useState<FoundItem | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(true);

  const [description, setDescription] = useState('');
  const [distinguishingFeature, setDistinguishingFeature] = useState('');
  const [additionalNote, setAdditionalNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  async function loadItem() {
    try {
      const data = await foundItemsService.getFoundItemById(itemId, token);
      setItem(data);
    } catch (error: any) {
      const message = error?.message || 'Talep gönderilemedi. Tekrar deneyin.';
      Alert.alert('Hata', message);
      console.error('Talep hatası:', error);
    } finally {
      setIsLoadingItem(false);
    }
  }

  async function handleSubmit() {
    if (!description.trim() || !distinguishingFeature.trim()) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      setIsSubmitting(true);
      await claimRequestsService.createClaimRequest(
        {
          itemId,
          description: description.trim(),
          distinguishingFeature: distinguishingFeature.trim(),
          additionalNote: additionalNote.trim() || undefined,
        },
        token
      );
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Success' }],
        })
      );
    } catch (error) {
      Alert.alert('Hata', 'Talep gönderilemedi. Tekrar deneyin.');
      console.error('Talep hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Teslim Talebi" showBack showNotification={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.itemSummary}>
            <View style={styles.itemIconBox}>
              <Ionicons
                name="card-outline"
                size={31}
                color={colors.yeditepeBlue}
              />
            </View>

            <View style={styles.itemTextBlock}>
              {isLoadingItem ? (
                <ActivityIndicator
                  size="small"
                  color={colors.yeditepeBlue}
                />
              ) : (
                <>
                  <Text style={styles.itemTitle}>
                    {item?.title ?? 'Bilinmiyor'}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {item?.location ?? ''} • Kayıtlı eşya
                  </Text>

                  <View style={styles.statusBadge}>
                    <Ionicons
                      name="time-outline"
                      size={13}
                      color={colors.yeditepeBlue}
                    />
                    <Text style={styles.statusText}>
                      {item
                        ? getFoundItemStatusLabel(item.status)
                        : ''}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Bu eşyayı nasıl tanıyorsunuz?</Text>
            <TextInput
              placeholder="Eşyanın size ait olduğunu gösteren bilgileri yazın..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Ayırt edici özelliği var mı?</Text>
            <TextInput
              placeholder="Örn: Kart üzerinde ismim yazıyor..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
              value={distinguishingFeature}
              onChangeText={setDistinguishingFeature}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Ek açıklama</Text>
            <TextInput
              placeholder="Güvenlik birimine iletmek istediğiniz ek not..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, styles.textAreaSmall]}
              multiline
              textAlignVertical="top"
              value={additionalNote}
              onChangeText={setAdditionalNote}
            />
          </View>

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.yeditepeBlue}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Talebiniz güvenlik/admin tarafından incelenecektir. Gerekirse
              kimlik doğrulaması istenebilir.
            </Text>
          </View>

          <Pressable
            style={[
              styles.submitButton,
              isSubmitting && { opacity: 0.7 },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Talebi Gönder</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <StudentBottomBar activeTab="listings" />
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
    paddingBottom: 150,
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

  itemSummary: {
    backgroundColor: 'rgba(34, 113, 196, 0.08)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(34, 113, 196, 0.14)',
  },

  itemIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  itemTextBlock: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },

  itemMeta: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginBottom: 8,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 13,
  },

  statusText: {
    color: colors.yeditepeBlue,
    fontSize: 10.5,
    fontWeight: '800',
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
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 211, 0.85)',
    borderRadius: 15,
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingTop: 13,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    outlineStyle: 'none' as any,
  },

  textArea: {
    minHeight: 112,
  },

  textAreaSmall: {
    minHeight: 90,
  },

  infoBox: {
    backgroundColor: '#F2F3FB',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 211, 0.55)',
    marginBottom: 18,
  },

  infoIcon: {
    marginRight: 9,
    marginTop: 1,
  },

  infoText: {
    flex: 1,
    fontSize: 12.4,
    lineHeight: 18,
    color: colors.textPrimary,
  },

  submitButton: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
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