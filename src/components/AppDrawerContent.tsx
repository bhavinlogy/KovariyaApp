import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, textStyles, borderRadius } from '../theme';

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
    <View style={styles.shell}>
      <View style={styles.orbLarge} pointerEvents="none" />
      <View style={styles.orbMid} pointerEvents="none" />
      <View style={styles.orbSmall} pointerEvents="none" />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcome}>Welcome,</Text>
        <Text style={styles.parentName}>{PARENT_GREETING_NAME}</Text>
        <Text style={styles.subline}>Child selection stays on Home for quick context.</Text>

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
    </View>
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
  welcome: {
    ...textStyles.caption,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  parentName: {
    ...textStyles.headingMedium,
    fontSize: 26,
    fontWeight: '800',
    color: colors.surface,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  subline: {
    ...textStyles.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    marginTop: spacing.sm,
    lineHeight: 18,
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
