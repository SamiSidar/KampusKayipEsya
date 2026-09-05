import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { StudentBottomBar } from '../components/StudentBottomBar';
import { RootStackParamList } from '../navigation/types';

// ============================================================
// SuccessScreen — Ortak başarı ekranı.
//
// Ne yapar:
// - 'from' parametresine göre farklı metin ve yönlendirme gösterir
//   ('report' → bildiri gönderildi, 'admin' → işlem tamamlandı)
// - Kullanıcıyı ilgili ana ekrana geri döndürür
// ============================================================

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SuccessRouteProp = RouteProp<RootStackParamList, 'Success'>;

export function SuccessScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SuccessRouteProp>();
  const isFromRegister = route.params?.from === 'register';
  const isFromAdmin = route.params?.from === 'admin';

  function resetTo(routeName: keyof RootStackParamList) {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName }],
      })
    );
  }

  if (isFromRegister) {
    return (
      <View style={styles.container}>
        <AppHeader title="Kayıt Başarılı" showBack={false} showNotification={false} />

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={54} color={colors.white} />
            </View>

            <Text style={styles.title}>Kayıt Başarılı!</Text>

            <Text style={styles.description}>
              Hesabınız başarıyla oluşturuldu. Şimdi giriş yaparak uygulamayı
              kullanmaya başlayabilirsiniz.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => resetTo('Login')}
              accessibilityLabel="Giriş yap"
            >
              <Text style={styles.primaryButtonText}>Giriş Yap</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (isFromAdmin) {
    return (
      <View style={styles.container}>
        <AppHeader title="Başarılı" showBack={false} showNotification={false} />

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={54} color={colors.white} />
            </View>

            <Text style={styles.title}>Bildiri Onaylandı</Text>

            <Text style={styles.description}>
              Bildiri başarıyla onaylandı ve aktif kayıp bildirimleri arasına eklendi.
              Öğrenci bildirimi alacaktır.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => resetTo('AdminPanel')}
              accessibilityLabel="Admin panele dön"
            >
              <Text style={styles.primaryButtonText}>Admin Panele Dön</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Başarılı" showBack={false} showNotification={false} />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={54} color={colors.white} />
          </View>

          <Text style={styles.title}>İşleminiz Gönderildi</Text>

          <Text style={styles.description}>
            İşleminiz güvenlik/admin onayına gönderildi. Durumunu ilgili ekran
            üzerinden takip edebilirsiniz.
          </Text>

          <View style={styles.statusBox}>
            <Ionicons
              name="time-outline"
              size={21}
              color={colors.yeditepeBlue}
              style={styles.statusIcon}
            />

            <View style={styles.statusTextBlock}>
              <Text style={styles.statusTitle}>Durum: Onay Bekliyor</Text>
              <Text style={styles.statusText}>
                İşleminiz yayınlanmadan veya sonuçlandırılmadan önce
                güvenlik/admin tarafından kontrol edilecektir.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => resetTo('MyReports')}
            accessibilityLabel="Bildirilerime git"
          >
            <Text style={styles.primaryButtonText}>Bildirilerime Git</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => resetTo('StudentHome')}
            accessibilityLabel="Ana sayfaya dön"
          >
            <Text style={styles.secondaryButtonText}>Ana Sayfaya Dön</Text>
          </Pressable>
        </View>
      </View>

      <StudentBottomBar activeTab="reports" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 90,
    justifyContent: 'center',
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 30,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },

  successCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },

  title: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.yeditepeBlue,
    textAlign: 'center',
    marginBottom: 10,
  },

  description: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },

  statusBox: {
    width: '100%',
    backgroundColor: colors.blueTint08,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.blueTint18,
    marginBottom: 22,
  },

  statusIcon: {
    marginRight: 10,
    marginTop: 1,
  },

  statusTextBlock: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.yeditepeBlue,
    marginBottom: 4,
  },

  statusText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textPrimary,
  },

  primaryButton: {
    width: '100%',
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
    marginBottom: 12,
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  secondaryButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    color: colors.yeditepeBlue,
    fontSize: 15,
    fontWeight: '700',
  },
});
