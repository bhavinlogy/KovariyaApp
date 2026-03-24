import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function resolveTabIconName(routeName: string): string {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Rating':
      return 'star';
    case 'Goals':
      return 'emoji-events';
    case 'Analytics':
      return 'bar-chart';
    case 'Profile':
      return 'person';
    default:
      return 'help';
  }
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
    >
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabSlot
              key={route.key}
              accessibilityLabel={options.title ?? route.name}
              isFocused={isFocused}
              routeName={route.name}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

type TabSlotProps = {
  isFocused: boolean;
  routeName: string;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
};

function TabSlot({
  isFocused,
  routeName,
  onPress,
  onLongPress,
  accessibilityLabel,
}: TabSlotProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 16, stiffness: 320 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 280 });
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const iconName = resolveTabIconName(routeName);
  const iconColor = isFocused ? colors.ink : colors.tabBarIconInactive;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.slot, animatedStyle]}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
    >
      <View style={styles.iconWrap}>
        {isFocused ? <View style={styles.activeDisc} /> : null}
        <Icon name={iconName} size={24} color={iconColor} style={styles.icon} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.tabBarBackground,
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    ...shadows.large,
    ...Platform.select({
      android: {
        marginBottom: spacing.xs,
      },
      default: {},
    }),
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDisc: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tabBarActivePill,
  },
  icon: {
    zIndex: 1,
  },
});
