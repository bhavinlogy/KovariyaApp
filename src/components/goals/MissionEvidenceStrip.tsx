import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { borderRadius, colors, spacing, textStyles } from '../../theme';

export type EvidenceKind = 'photo' | 'voice' | 'text';

type Props = {
  missionId: string;
  /** Which channels this mission accepts. Others show as optional / not required. */
  allowed: EvidenceKind[];
  missionCompleted: boolean;
  onChannelPress: (missionId: string, kind: EvidenceKind, allowed: boolean) => void;
};

const CHANNELS: { kind: EvidenceKind; label: string; icon: string; hint: string }[] = [
  { kind: 'photo', label: 'Photo', icon: 'photo-camera', hint: 'Snap or upload' },
  { kind: 'voice', label: 'Voice', icon: 'mic', hint: 'Short voice note' },
  { kind: 'text', label: 'Text', icon: 'edit-note', hint: 'Written reflection' },
];

export const MissionEvidenceStrip = React.memo(function MissionEvidenceStrip({
  missionId,
  allowed,
  missionCompleted,
  onChannelPress,
}: Props) {
  const isAllowed = useCallback((k: EvidenceKind) => allowed.includes(k), [allowed]);

  return (
    <View style={styles.wrap}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Submit evidence</Text>
        <Text style={styles.sectionHint}>
          All three channels are visible. Only unlocked ones are needed for this mission.
        </Text>
      </View>

      <View style={styles.row}>
        {CHANNELS.map(({ kind, label, icon, hint }) => {
          const on = isAllowed(kind);
          return (
            <Pressable
              key={kind}
              style={[styles.tile, on ? styles.tileActive : styles.tileLocked]}
              onPress={() => onChannelPress(missionId, kind, on)}
              disabled={missionCompleted}
              accessibilityRole="button"
              accessibilityLabel={`${label} evidence`}
              accessibilityState={{ disabled: missionCompleted }}
            >
              <View style={[styles.tileIconWrap, on ? styles.tileIconOn : styles.tileIconOff]}>
                <Icon name={icon} size={22} color={on ? colors.ink : colors.textMuted} />
                {!on ? (
                  <View style={styles.lockBadge}>
                    <Icon name="lock-outline" size={12} color={colors.textMuted} />
                  </View>
                ) : null}
              </View>
              <Text style={[styles.tileLabel, !on && styles.tileLabelMuted]}>{label}</Text>
              <Text style={styles.tileHint}>{on ? hint : 'Not required'}</Text>
              {on ? (
                <View style={styles.availableBadge}>
                  <Text style={styles.availableBadgeText}>Required</Text>
                </View>
              ) : (
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalBadgeText}>Optional</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {missionCompleted ? (
        <Text style={styles.doneNote}>Evidence locked — mission already marked complete.</Text>
      ) : (
        <Text style={styles.footerNote}>
          Tip: start with the fastest channel (often text), then add photo or voice if needed.
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionHint: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    borderRadius: borderRadius.large,
    padding: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 128,
  },
  tileActive: {
    backgroundColor: colors.lavenderSoft,
    borderColor: 'rgba(124, 106, 232, 0.35)',
  },
  tileLocked: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    opacity: 0.92,
  },
  tileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    position: 'relative',
  },
  tileIconOn: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tileIconOff: {
    backgroundColor: colors.surface,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tileLabel: {
    ...textStyles.caption,
    fontWeight: '700',
    color: colors.ink,
  },
  tileLabelMuted: {
    color: colors.textSecondary,
  },
  tileHint: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: 2,
    flex: 1,
  },
  availableBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.mintSoft,
  },
  availableBadgeText: {
    ...textStyles.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.growth,
  },
  optionalBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
  },
  optionalBadgeText: {
    ...textStyles.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  doneNote: {
    ...textStyles.caption,
    color: colors.growth,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  footerNote: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});
