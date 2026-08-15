import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type StudentTab = 'home' | 'listings' | 'reports' | 'profile';

type StudentBottomBarProps = {
  activeTab: StudentTab;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function StudentBottomBar({ activeTab }: StudentBottomBarProps) {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <TabButton
        label="Ana Sayfa"
        icon={activeTab === 'home' ? 'home' : 'home-outline'}
        active={activeTab === 'home'}
        onPress={() => navigation.navigate('StudentHome')}
      />

      <TabButton
        label="İlanlar"
        icon={activeTab === 'listings' ? 'list' : 'list-outline'}
        active={activeTab === 'listings'}
        onPress={() => navigation.navigate('Listings')}
      />

      <TabButton
        label="Bildirilerim"
        icon={activeTab === 'reports' ? 'clipboard' : 'clipboard-outline'}
        active={activeTab === 'reports'}
        onPress={() => navigation.navigate('MyReports')}
      />

      <TabButton
        label="Profil"
        icon={activeTab === 'profile' ? 'person' : 'person-outline'}
        active={activeTab === 'profile'}
        onPress={() => navigation.navigate('StudentProfile')}
      />
    </View>
  );
}

type TabButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
};

function TabButton({ label, icon, active, onPress }: TabButtonProps) {
  return (
    <Pressable style={styles.tab} onPress={onPress}>
      <Ionicons
        name={icon}
        size={27}
        color={active ? colors.yeditepeBlue : colors.textSecondary}
      />

      <Text style={[styles.label, active && styles.activeLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 86,
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

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
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