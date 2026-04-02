import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../components';
import { colors, spacing, textStyles, getFloatingTabBarBottomPadding, borderRadius } from '../theme';
import { Child } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatAppMonthYear } from '../utils/dateFormat';

type SettingId =
  | 'notifications'
  | 'privacy'
  | 'help'
  | 'feedback'
  | 'about';

type SettingRow = {
  id: SettingId;
  icon: string;
  title: string;
  subtitle: string;
};

const MOCK_CHILDREN: Child[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    age: 8,
    avatar: 'https://example.com/emma.jpg',
  },
  {
    id: '2',
    name: 'Noah Johnson',
    age: 6,
    avatar: 'https://example.com/noah.jpg',
  },
];

const SETTINGS_ROWS: SettingRow[] = [
  {
    id: 'notifications',
    icon: 'notifications',
    title: 'Notifications',
    subtitle: 'Manage your notification preferences',
  },
  {
    id: 'privacy',
    icon: 'security',
    title: 'Privacy & Security',
    subtitle: 'Control your data and privacy settings',
  },
  {
    id: 'help',
    icon: 'help',
    title: 'Help & Support',
    subtitle: 'Get help and contact support',
  },
  {
    id: 'feedback',
    icon: 'feedback',
    title: 'Send Feedback',
    subtitle: 'Help us improve Kovariya',
  },
  {
    id: 'about',
    icon: 'info',
    title: 'About',
    subtitle: 'App version and legal information',
  },
];

function initialsFromFullName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || '?';
}

function firstNameInitial(name: string): string {
  const first = name.trim().split(/\s+/)[0];
  return first ? first.charAt(0).toUpperCase() : '?';
}

function InitialAvatar({
  label,
  size,
  backgroundColor,
  style,
}: {
  label: string;
  size: number;
  backgroundColor: string;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.38, fontWeight: '700', color: colors.ink } as TextStyle}>
        {label}
      </Text>
    </View>
  );
}

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const parentInfo = {
    name: user?.name || 'Wellness User',
    email: user?.email || 'user@kovariya.com',
    phone: '+1 (555) 123-4567',
    memberSince: user?.createdAt ? formatAppMonthYear(user.createdAt) || 'Jan 2024' : 'Jan 2024',
  };

  const scrollBottomPad = useMemo(
    () => getFloatingTabBarBottomPadding(insets.bottom),
    [insets.bottom]
  );

  const handleSettingPress = useCallback((id: SettingId) => {
    // Handle other settings when implemented
    console.log(`Setting pressed: ${id}`);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scrollBottomPad }}
      >
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <InitialAvatar
                label={initialsFromFullName(parentInfo.name)}
                size={80}
                backgroundColor={colors.lavenderSoft}
              />
              <TouchableOpacity
                style={styles.editButton}
                accessibilityRole="button"
                accessibilityLabel="Edit profile photo"
              >
                <Icon name="edit" size={16} color={colors.ink} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{parentInfo.name}</Text>
              <Text style={styles.profileEmail}>{parentInfo.email}</Text>
              <Text style={styles.memberSince}>Member since {parentInfo.memberSince}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>152</Text>
            <Text style={styles.statLabel}>Total Ratings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Goals Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.5</Text>
            <Text style={styles.statLabel}>Avg. Score</Text>
          </View>
        </View>

        <Card variant="elevated" style={styles.childrenCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Children</Text>
            <TouchableOpacity
              style={styles.addButton}
              accessibilityRole="button"
              accessibilityLabel="Add child"
            >
              <Icon name="add" size={20} color={colors.ink} />
            </TouchableOpacity>
          </View>
          {MOCK_CHILDREN.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.childItem}
              accessibilityRole="button"
              accessibilityLabel={`${child.name}, age ${child.age}`}
            >
              <View style={styles.childAvatar}>
                <InitialAvatar
                  label={firstNameInitial(child.name)}
                  size={50}
                  backgroundColor={colors.skySoft}
                />
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childAge}>Age {child.age}</Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </Card>

        <Card variant="elevated" style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {SETTINGS_ROWS.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.settingItem,
                index === SETTINGS_ROWS.length - 1 && styles.lastSettingItem,
              ]}
              onPress={() => handleSettingPress(option.id)}
              accessibilityRole="button"
              accessibilityLabel={option.title}
            >
              <View style={styles.settingLeft}>
                <Icon name={option.icon} size={24} color={colors.ink} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>
                    {option.title}
                  </Text>
                  <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </Card>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Kovariya v1.0.0</Text>
          <Text style={styles.versionSubtext}>Smart Parenting. Better Children.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  profileCard: {
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.medium,
    padding: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...textStyles.headingMedium,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  memberSince: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...textStyles.headingLarge,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  childrenCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...textStyles.headingMedium,
  },
  addButton: {
    backgroundColor: colors.lavenderSoft,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  childAvatar: {
    marginRight: spacing.md,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    ...textStyles.bodyLarge,
    fontWeight: '500',
  },
  childAge: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
  },
  settingsCard: {
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingTitle: {
    ...textStyles.bodyLarge,
    fontWeight: '500',
  },
  settingSubtitle: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  versionText: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  versionSubtext: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});

export default ProfileScreen;
