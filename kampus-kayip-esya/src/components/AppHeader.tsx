import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type AppHeaderProps = {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function AppHeader({
  title,
  showBack = true,
  showNotification = true,
}: AppHeaderProps) {
  const navigation = useNavigation<NavigationProp>();

  function handleBackPress() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable style={styles.iconButton} onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={27} color={colors.white} />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.side}>
        {showNotification ? (
          <Pressable style={styles.rightIconButton}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.white}
            />
            <View style={styles.notificationDot} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 72,
    backgroundColor: colors.yeditepeBlue,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 6,
  },

  side: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    flex: 1,
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  notificationDot: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: colors.yeditepeBlue,
  },
});
