import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { colors } from '../theme/colors';

/**
 * Ağ durumu context'i.
 * 
 * Kurulum:
 *   1. npx expo install @react-native-community/netinfo
 *   2. Aşağıdaki NetInfo import yorumunu kaldır
 *   3. useEffect içindeki simülasyonu kaldır, NetInfo.addEventListener kullan
 */

// import NetInfo from '@react-native-community/netinfo';

type NetworkState = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
};

const NetworkContext = createContext<NetworkState>({
  isConnected: true,
  isInternetReachable: true,
});

export function useNetwork() {
  return useContext(NetworkContext);
}

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    // NetInfo kurulduktan sonra bu bloku aktif edin:
    //
    // const unsubscribe = NetInfo.addEventListener((netState) => {
    //   setState({
    //     isConnected: netState.isConnected ?? false,
    //     isInternetReachable: netState.isInternetReachable ?? null,
    //   });
    // });
    // return () => unsubscribe();

    // Web: navigator.onLine kullan (CORS sorunu olmaz)
    // Mobil: fetch ile backend'e ping at
    if (Platform.OS === 'web') {
      const update = () => {
        setState({
          isConnected: navigator.onLine,
          isInternetReachable: navigator.onLine,
        });
      };
      update();
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
      return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
      };
    }

    // Mobil: fetch tabanlı kontrol
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        await fetch('https://www.google.com/generate_204', {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timer);
        setState({ isConnected: true, isInternetReachable: true });
      } catch {
        setState({ isConnected: false, isInternetReachable: false });
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NetworkContext.Provider value={state}>
      {children}
      {!state.isConnected && <OfflineBanner />}
    </NetworkContext.Provider>
  );
}

function OfflineBanner() {
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.banner, { opacity: fadeAnim }]}>
      <Text style={styles.bannerText}>
        İnternet bağlantısı yok. Bazı özellikler çalışmayabilir.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.error,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bannerText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
