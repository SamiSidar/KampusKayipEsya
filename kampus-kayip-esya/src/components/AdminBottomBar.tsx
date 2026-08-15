import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type AdminTab = 'panel' | 'plus' | 'profile';

type AdminBottomBarProps = {
  activeTab: AdminTab;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function AdminBottomBar({ activeTab }: AdminBottomBarProps) {
  const navigation = useNavigation<NavigationProp>();

  function resetToAdminPanel() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'AdminPanel' }],
      })
    );
  }

  function resetToFoundItemCreate() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'FoundItemCreate' }],
      })
    );
  }

  function resetToAdminProfile() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'AdminProfile' }],
      })
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.sideTab} onPress={resetToAdminPanel}>
        <Ionicons
          name={activeTab === 'panel' ? 'grid' : 'grid-outline'}
          size={27}
          color={
            activeTab === 'panel'
              ? colors.yeditepeBlue
              : colors.textSecondary
          }
        />

        <Text
          style={[
            styles.label,
            activeTab === 'panel' && styles.activeLabel,
          ]}
        >
          Panel
        </Text>
      </Pressable>

      <Pressable
        style={styles.plusButtonWrapper}
        onPress={resetToFoundItemCreate}
      >
        <View style={styles.plusButton}>
          <Ionicons name="add" size={36} color={colors.white} />
        </View>
      </Pressable>

      <Pressable style={styles.sideTab} onPress={resetToAdminProfile}>
        <Ionicons
          name={activeTab === 'profile' ? 'person' : 'person-outline'}
          size={27}
          color={
            activeTab === 'profile'
              ? colors.yeditepeBlue
              : colors.textSecondary
          }
        />

        <Text
          style={[
            styles.label,
            activeTab === 'profile' && styles.activeLabel,
          ]}
        >
          Profil
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 88,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(193, 198, 211, 0.38)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    elevation: 10,
  },

  sideTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  plusButtonWrapper: {
    width: 108,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },

  plusButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: colors.white,
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 8,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  activeLabel: {
    color: colors.yeditepeBlue,
    fontWeight: '800',
  },
});