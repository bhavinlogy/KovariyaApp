import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { borderRadius, colors, spacing, textStyles } from '../theme';
import { GRADIENT_60_END } from '../theme/layout';

export type AppGradientHeaderLeadingMode = 'menu' | 'back' | 'none';

export type AppGradientHeaderProps = {
  title: string;
  subtitle?: string;
  /**
   * Left control: drawer menu (default), stack back, or empty spacer for symmetry.
   */
  leadingMode?: AppGradientHeaderLeadingMode;
  /** When `leadingMode` is `back`, defaults to `navigation.goBack()`. */
  onBackPress?: () => void;
  /**
   * Right slot (e.g. notifications). Omit for a fixed 44×44 spacer so the title stays centered
   * (same balance as the leading control on the left).
   */
  rightAccessory?: React.ReactNode;
  /** If omitted, dispatches `DrawerActions.openDrawer()` when `leadingMode` is `menu`. */
  onMenuPress?: () => void;
  /** @deprecated Use `leadingMode="none"` instead. */
  showMenuButton?: boolean;
  /** Merged into the root `LinearGradient` wrapper. */
  style?: ViewStyle;
};

/**
 * Shared gradient header (orbs, menu, centered title + subtitle) matching Dashboard / Missions.
 * Safe-area top inset is applied inside via `useSafeAreaInsets`.
 */
export const AppGradientHeader = React.memo(function AppGradientHeader({
  title,
  subtitle,
  leadingMode: leadingModeProp,
  onBackPress,
  rightAccessory,
  onMenuPress,
  showMenuButton = true,
  style,
}: AppGradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const leadingMode: AppGradientHeaderLeadingMode =
    leadingModeProp ?? (showMenuButton ? 'menu' : 'none');

  const handleMenu = useCallback(() => {
    if (onMenuPress) {
      onMenuPress();
      return;
    }
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation, onMenuPress]);

  const handleBack = useCallback(() => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    navigation.goBack();
  }, [navigation, onBackPress]);

  const right = rightAccessory ?? <View style={styles.rightSpacer} />;
  const showSubtitle = Boolean(subtitle?.trim());

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={GRADIENT_60_END}
      style={[styles.gradient, { paddingTop: insets.top }, style]}
    >
      <View style={styles.headerOrbs} pointerEvents="none">
        <View style={styles.headerOrbLarge} />
        <View style={styles.headerOrbMid} />
        <View style={styles.headerOrbTiny} />
      </View>
      <View style={styles.header}>
        <View style={styles.headerLeftControls}>
          {leadingMode === 'menu' ? (
            <Pressable
              onPress={handleMenu}
              style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              hitSlop={8}
              android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: true }}
            >
              <Icon name="menu" size={26} color="rgba(255, 255, 255, 0.92)" />
            </Pressable>
          ) : null}
          {leadingMode === 'back' ? (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: true }}
            >
              <Icon name="arrow-back" size={26} color="rgba(255, 255, 255, 0.92)" />
            </Pressable>
          ) : null}
          {leadingMode === 'none' ? <View style={styles.rightSpacer} /> : null}
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerCenterTitle} numberOfLines={1}>
            {title}
          </Text>
          {showSubtitle ? (
            <Text style={styles.headerCenterSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {right}
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    marginBottom: spacing.xs,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  headerOrbs: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOrbLarge: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    top: -100,
    right: -72,
  },
  headerOrbMid: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(232, 228, 255, 0.16)',
    bottom: 10,
    left: 12,
  },
  headerOrbTiny: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    top: 18,
    left: '38%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    zIndex: 1,
    gap: spacing.sm,
  },
  headerLeftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuButton: {
    padding: spacing.xs,
    marginRight: -spacing.xs,
    borderRadius: borderRadius.full,
  },
  menuButtonPressed: {
    opacity: 0.88,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: spacing.sm,
  },
  headerCenterTitle: {
    ...textStyles.headingMedium,
    color: colors.surface,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerCenterSubtitle: {
    ...textStyles.caption,
    color: 'rgba(255,255,255,0.76)',
    fontWeight: '600',
    marginTop: 1,
  },
  rightSpacer: {
    width: 44,
    height: 44,
    flexShrink: 0,
  },
});
