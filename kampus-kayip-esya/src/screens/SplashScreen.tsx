import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

// ============================================================
// SplashScreen — Uygulama açılış ekranı.
//
// Ne yapar:
// - Logo gösterir (1.5 saniye)
// - AuthContext'ten kullanıcı durumunu kontrol eder
// - Token varsa ve geçerliyse → role'e göre yönlendirir
//   STUDENT → StudentHome, ADMIN/SECURITY → AdminPanel
// - Token yoksa → Login ekranına gider
// ============================================================

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Auth kontrolü henüz bitmemişse bekle
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        // Kullanıcı zaten giriş yapmış — role'e göre yönlendir
        if (user.role === 'STUDENT') {
          navigation.replace('StudentHome');
        } else {
          navigation.replace('AdminPanel');
        }
      } else {
        // Giriş yapılmamış — Login ekranına git
        navigation.replace('Login');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, user, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.yeditepeBlue}
      />

      <Image
        source={require('../../assets/yeditepe-logo-temp.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 245,
    height: 200,
  },
});