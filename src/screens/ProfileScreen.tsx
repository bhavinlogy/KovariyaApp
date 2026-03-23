import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, Button } from '../components';
import { colors, spacing, textStyles } from '../theme';
import { Child } from '../types';

const ProfileScreen: React.FC = () => {
  // Mock data
  const parentInfo = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    memberSince: 'January 2024',
  };

  const children: Child[] = [
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

  const settingsOptions = [
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onPress: () => console.log('Notifications'),
    },
    {
      icon: 'security',
      title: 'Privacy & Security',
      subtitle: 'Control your data and privacy settings',
      onPress: () => console.log('Privacy'),
    },
    {
      icon: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => console.log('Help'),
    },
    {
      icon: 'feedback',
      title: 'Send Feedback',
      subtitle: 'Help us improve Kovariya',
      onPress: () => console.log('Feedback'),
    },
    {
      icon: 'info',
      title: 'About',
      subtitle: 'App version and legal information',
      onPress: () => console.log('About'),
    },
    {
      icon: 'logout',
      title: 'Sign Out',
      subtitle: 'Sign out of your account',
      onPress: () => console.log('Sign out'),
      isDestructive: true,
    },
  ];

  const renderProfileHeader = () => (
    <Card variant="elevated" style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://example.com/parent.jpg' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editButton}>
            <Icon name="edit" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{parentInfo.name}</Text>
          <Text style={styles.profileEmail}>{parentInfo.email}</Text>
          <Text style={styles.memberSince}>Member since {parentInfo.memberSince}</Text>
        </View>
      </View>
    </Card>
  );

  const renderChildrenSection = () => (
    <Card variant="elevated" style={styles.childrenCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Children</Text>
        <TouchableOpacity style={styles.addButton}>
          <Icon name="add" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {children.map((child) => (
        <TouchableOpacity key={child.id} style={styles.childItem}>
          <View style={styles.childAvatar}>
            <Image
              source={{ uri: child.avatar }}
              style={styles.childImage}
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
  );

  const renderSettingsSection = () => (
    <Card variant="elevated" style={styles.settingsCard}>
      <Text style={styles.sectionTitle}>Settings</Text>
      {settingsOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.settingItem, index === settingsOptions.length - 1 && styles.lastSettingItem]}
          onPress={option.onPress}
        >
          <View style={styles.settingLeft}>
            <Icon
              name={option.icon}
              size={24}
              color={option.isDestructive ? colors.error : colors.primary}
            />
            <View style={styles.settingText}>
              <Text
                style={[
                  styles.settingTitle,
                  option.isDestructive && { color: colors.error },
                ]}
              >
                {option.title}
              </Text>
              <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      ))}
    </Card>
  );

  const renderQuickStats = () => (
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
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        {renderProfileHeader()}

        {/* Quick Stats */}
        {renderQuickStats()}

        {/* Children Section */}
        {renderChildrenSection()}

        {/* Settings Section */}
        {renderSettingsSection()}

        {/* App Version */}
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
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xs,
    borderWidth: 1,
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
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...textStyles.headingLarge,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  childrenCard: {
    marginBottom: spacing.lg,
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
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
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
  childImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.border,
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
    marginBottom: spacing.lg,
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
    paddingVertical: spacing.xl,
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
