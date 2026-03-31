import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, textStyles, borderRadius } from '../theme';
import { useChildren } from '../context/ChildrenContext';

const PARENT_GREETING_NAME = 'Sarah';

const MENU_ITEMS = [
  { key: 'sessions', label: 'Sessions', icon: 'event', route: 'Sessions' as const },
  { key: 'quizzes', label: 'Quizzes', icon: 'poll', route: 'Quizzes' as const },
  { key: 'announcements', label: 'Announcements', icon: 'campaign', route: 'Announcements' as const },
  { key: 'tutorials', label: 'Tutorials', icon: 'menu-book', route: 'Tutorials' as const },
];

/**
 * Sidebar: light primary surface, white text, soft white orbs.
 * Greeting here is a light duplicate of Home — child selection stays on the dashboard header.
 */
export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { navigation } = props;
  const { children, selectedChildId, openChildPicker } = useChildren();
  const selectedChild = useMemo(
    () => children.find((c) => c.id === selectedChildId) ?? children[0],
    [children, selectedChildId]
  );

  const goTo = useCallback(
    (routeName: (typeof MENU_ITEMS)[number]['route']) => {
      navigation.closeDrawer();
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate(routeName as never);
      }
    },
    [navigation]
  );

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 0.866 }}
      style={styles.shell}
    >
      <View style={styles.orbLarge} pointerEvents="none" />
      <View style={styles.orbMid} pointerEvents="none" />
      <View style={styles.orbSmall} pointerEvents="none" />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileArea}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarBubble}>
              <Text style={styles.avatarBubbleText}>{PARENT_GREETING_NAME.slice(0, 1)}</Text>
            </View>
            <Text style={styles.welcomeParent} numberOfLines={2} ellipsizeMode="tail">
              Welcome, {PARENT_GREETING_NAME}
            </Text>
          </View>
          <Text style={styles.subline}>Select child profile for dashboard analytics and reports.</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.childSelectorRow,
            pressed && styles.childSelectorRowPressed,
          ]}
          onPress={() => {
            navigation.closeDrawer();
            openChildPicker();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Change child. Now showing ${selectedChild.name}`}
        >
          <Icon name="child-care" size={18} color="rgba(255,255,255,0.9)" />
          <View style={styles.childSelectorMain}>
            <Text style={styles.childSelectorName} numberOfLines={1}>
              {selectedChild.name}
            </Text>
            <Text style={styles.childSelectorAge} numberOfLines={1}>
              Age {selectedChild.age} years
            </Text>
          </View>
          <Icon name="expand-more" size={20} color="rgba(255,255,255,0.75)" />
        </Pressable>

        <View style={styles.divider} />

        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => goTo(item.route)}
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <View style={styles.menuIconOrb}>
              <Icon name={item.icon} size={22} color={colors.surface} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Icon name="chevron-right" size={22} color="rgba(255,255,255,0.7)" />
          </Pressable>
        ))}
      </DrawerContentScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.lavender,
    overflow: 'hidden',
  },
  orbLarge: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    top: -56,
    right: -48,
  },
  orbMid: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    bottom: 120,
    left: -20,
  },
  orbSmall: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    top: '42%',
    right: 24,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileArea: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  childSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  childSelectorRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.28)',
  },
  childSelectorMain: {
    flex: 1,
    minWidth: 0,
  },
  childSelectorName: {
    ...textStyles.bodyLarge,
    color: colors.surface,
    fontWeight: '700',
  },
  childSelectorAge: {
    ...textStyles.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '600',
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarBubbleText: {
    ...textStyles.headingMedium,
    color: colors.surface,
    fontWeight: '800',
  },
  welcomeParent: {
    ...textStyles.headingMedium,
    fontSize: 20,
    fontWeight: '800',
    color: colors.surface,
    letterSpacing: -0.2,
    flex: 1,
  },
  subline: {
    ...textStyles.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  childList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.large,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  childRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  childRowSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.42)',
  },
  childAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  childAvatarSelected: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  childAvatarText: {
    ...textStyles.caption,
    color: colors.surface,
    fontWeight: '800',
  },
  childMeta: {
    flex: 1,
  },
  childName: {
    ...textStyles.bodyLarge,
    color: colors.surface,
    fontWeight: '700',
  },
  childAge: {
    ...textStyles.caption,
    color: 'rgba(255,255,255,0.75)',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.28)',
    marginVertical: spacing.lg,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.large,
    marginBottom: spacing.xs,
  },
  menuRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  menuIconOrb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  menuLabel: {
    ...textStyles.bodyLarge,
    flex: 1,
    fontWeight: '700',
    fontSize: 16,
    color: colors.surface,
  },
});
