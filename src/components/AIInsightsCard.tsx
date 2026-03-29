import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from './Card';
import { colors, spacing, textStyles, borderRadius } from '../theme';
import type { AIInsightsPayload } from '../types';

type Props = {
  payload: AIInsightsPayload;
};

export const AIInsightsCard = React.memo(function AIInsightsCard({ payload }: Props) {
  const { title, subtitle, sourceLabel, positive, attention } = payload;

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleIconWrap}>
          <Icon name="auto-awesome" size={22} color={colors.primaryDark} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.source}>{sourceLabel}</Text>

      <View style={[styles.block, styles.blockPositive]}>
        <View style={styles.blockHeader}>
          <View style={[styles.blockIconCircle, styles.blockIconPositive]}>
            <Icon name={positive.iconName} size={22} color={colors.growth} />
          </View>
          <View style={styles.blockHeaderText}>
            <Text style={styles.blockHeadingPositive}>{positive.heading}</Text>
            <Text style={styles.blockSub}>{positive.subheading}</Text>
          </View>
        </View>
        {positive.lines.map((line) => (
          <View key={line.id} style={styles.lineRow}>
            <Icon name="check-circle" size={18} color={colors.growth} style={styles.lineIcon} />
            <Text style={styles.lineText}>{line.text}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.block, styles.blockAttention]}>
        <View style={styles.blockHeader}>
          <View style={[styles.blockIconCircle, styles.blockIconAttention]}>
            <Icon name={attention.iconName} size={22} color={colors.warning} />
          </View>
          <View style={styles.blockHeaderText}>
            <Text style={styles.blockHeadingAttention}>{attention.heading}</Text>
            <Text style={styles.blockSub}>{attention.subheading}</Text>
          </View>
        </View>
        {attention.lines.map((line) => (
          <View key={line.id} style={styles.lineRow}>
            <Icon name="arrow-circle-right" size={18} color={colors.warning} style={styles.lineIcon} />
            <Text style={styles.lineTextAttention}>{line.text}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  titleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(124, 106, 232, 0.22)',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...textStyles.headingMedium,
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 2,
  },
  subtitle: {
    ...textStyles.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  source: {
    ...textStyles.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  block: {
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  blockPositive: {
    backgroundColor: colors.mintSoft,
    borderColor: 'rgba(63, 169, 122, 0.28)',
  },
  blockAttention: {
    backgroundColor: colors.peachSoft,
    borderColor: 'rgba(232, 160, 74, 0.35)',
    marginBottom: 0,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  blockIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  blockIconPositive: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(63, 169, 122, 0.35)',
  },
  blockIconAttention: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(232, 160, 74, 0.45)',
  },
  blockHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  blockHeadingPositive: {
    ...textStyles.headingMedium,
    fontSize: 17,
    fontWeight: '800',
    color: '#145A3D',
    letterSpacing: -0.2,
  },
  blockHeadingAttention: {
    ...textStyles.headingMedium,
    fontSize: 17,
    fontWeight: '800',
    color: '#8B4514',
    letterSpacing: -0.2,
  },
  blockSub: {
    ...textStyles.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  lineIcon: {
    marginTop: 2,
  },
  lineText: {
    ...textStyles.bodyMedium,
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  lineTextAttention: {
    ...textStyles.bodyMedium,
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#5C3D1E',
  },
});
