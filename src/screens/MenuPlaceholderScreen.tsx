import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, textStyles, borderRadius } from '../theme';

type Props = {
  navigation: { goBack: () => void };
  route: { params?: { title?: string } };
};

/**
 * Placeholder for drawer destinations (Sessions, Quizzes, etc.).
 * Replace with real screens when flows are ready.
 */
export function MenuPlaceholderScreen({ navigation, route }: Props) {
  const title = route.params?.title ?? 'Screen';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.lead}>This section will be available in a future update.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
  },
  backBtnPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    ...textStyles.headingMedium,
    flex: 1,
    fontSize: 18,
    color: colors.ink,
  },
  body: {
    flex: 1,
    padding: spacing.lg,
  },
  lead: {
    ...textStyles.bodyLarge,
    color: colors.textSecondary,
  },
});
