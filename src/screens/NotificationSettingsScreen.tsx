import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar as RNStatusBar,
  Switch,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
  LinearTransition,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppGradientHeader, Card } from '../components';
import {
  colors,
  spacing,
  textStyles,
  getFloatingTabBarBottomPadding,
  borderRadius,
  typography,
} from '../theme';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';

/* ─── Types ────────────────────────────────────────────────────────────────── */

type NotificationCategory = {
  id: string;
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  iconColor: string;
  iconBg: string;
};

type QuietHourSlot = {
  id: string;
  label: string;
  time: string;
  active: boolean;
};

/* ─── Static data ──────────────────────────────────────────────────────────── */

const INITIAL_CATEGORIES: NotificationCategory[] = [
  {
    id: 'daily_ratings',
    icon: 'star',
    title: 'Daily Ratings',
    description: 'Reminders to rate your child\'s daily progress',
    enabled: true,
    iconColor: colors.accent,
    iconBg: colors.peachSoft,
  },
  {
    id: 'goal_milestones',
    icon: 'emoji-events',
    title: 'Goal Milestones',
    description: 'Celebrate when goals are achieved',
    enabled: true,
    iconColor: colors.growth,
    iconBg: colors.mintSoft,
  },
  {
    id: 'weekly_insights',
    icon: 'insights',
    title: 'Weekly Insights',
    description: 'Analytics summary delivered every Sunday',
    enabled: true,
    iconColor: colors.primary,
    iconBg: colors.lavenderSoft,
  },
  {
    id: 'mission_updates',
    icon: 'rocket-launch',
    title: 'Mission Updates',
    description: 'New missions and completion alerts',
    enabled: false,
    iconColor: colors.info,
    iconBg: colors.skySoft,
  },
  {
    id: 'announcements',
    icon: 'campaign',
    title: 'Announcements',
    description: 'School and community announcements',
    enabled: true,
    iconColor: '#E85D5D',
    iconBg: '#FFECEC',
  },
  {
    id: 'tips_advice',
    icon: 'lightbulb',
    title: 'Tips & Advice',
    description: 'Parenting tips and expert recommendations',
    enabled: false,
    iconColor: colors.accent,
    iconBg: colors.peachSoft,
  },
];

const INITIAL_QUIET_HOURS: QuietHourSlot[] = [
  { id: 'sleep', label: 'Sleep time', time: '10 PM – 7 AM', active: true },
  { id: 'school', label: 'School hours', time: '8 AM – 3 PM', active: false },
];

const DELIVERY_OPTIONS = [
  { id: 'push', icon: 'notifications-active', label: 'Push', sublabel: 'Instant alerts' },
  { id: 'email', icon: 'email', label: 'Email', sublabel: 'Daily digest' },
  { id: 'sms', icon: 'sms', label: 'SMS', sublabel: 'Critical only' },
] as const;

/* ─── Animated Toggle ──────────────────────────────────────────────────────── */

function AnimatedToggle({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  /* Use RN Switch on native platforms for best UX */
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{
        false: colors.surfaceMuted,
        true: colors.primary,
      }}
      thumbColor={value ? colors.surface : '#E8E4FF'}
      ios_backgroundColor={colors.surfaceMuted}
      style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
    />
  );
}

/* ─── Notification Category Row ─────────────────────────────────────── */

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CategoryRow({
  category,
  index,
  isLast,
  onToggle,
}: {
  category: NotificationCategory;
  index: number;
  isLast: boolean;
  onToggle: (id: string, value: boolean) => void;
}) {
  return (
    <Animated.View
      entering={FadeInRight.delay(80 * index)
        .springify()
        .damping(20)
        .stiffness(180)}
      layout={LinearTransition.springify()}
    >
      <View style={[styles.categoryRow, !isLast && styles.categoryRowBorder]}>
        <View
          style={[
            styles.categoryIconOrb,
            { backgroundColor: category.iconBg },
          ]}
        >
          <Icon name={category.icon} size={22} color={category.iconColor} />
        </View>
        <View style={styles.categoryText}>
          <Text
            style={[
              styles.categoryTitle,
              !category.enabled && styles.disabledText,
            ]}
          >
            {category.title}
          </Text>
          <Text
            style={[
              styles.categoryDesc,
              !category.enabled && styles.disabledText,
            ]}
            numberOfLines={2}
          >
            {category.description}
          </Text>
        </View>
        <AnimatedToggle
          value={category.enabled}
          onValueChange={(v) => onToggle(category.id, v)}
        />
      </View>
    </Animated.View>
  );
}

/* ─── Delivery Chip ──────────────────────────────────────────────────── */

function DeliveryChip({
  option,
  selected,
  onPress,
  index,
}: {
  option: (typeof DELIVERY_OPTIONS)[number];
  selected: boolean;
  onPress: () => void;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(60 * index)
        .springify()
        .damping(18)
        .stiffness(200)}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.deliveryChip,
          selected && styles.deliveryChipActive,
          pressed && styles.pressedOpacity,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${option.label} delivery`}
      >
        <View
          style={[
            styles.deliveryChipIcon,
            selected && styles.deliveryChipIconActive,
          ]}
        >
          <Icon
            name={option.icon}
            size={22}
            color={selected ? colors.surface : colors.primaryDark}
          />
        </View>
        <Text
          style={[
            styles.deliveryChipLabel,
            selected && styles.deliveryChipLabelActive,
          ]}
        >
          {option.label}
        </Text>
        <Text
          style={[
            styles.deliveryChipSub,
            selected && styles.deliveryChipSubActive,
          ]}
        >
          {option.sublabel}
        </Text>
        {selected && (
          <View style={styles.checkBadge}>
            <Icon name="check-circle" size={18} color={colors.growth} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

/* ─── Quiet Hour Row ─────────────────────────────────────────────────── */

function QuietHourRow({
  slot,
  isLast,
  onToggle,
}: {
  slot: QuietHourSlot;
  isLast: boolean;
  onToggle: (id: string, value: boolean) => void;
}) {
  return (
    <View style={[styles.quietRow, !isLast && styles.quietRowBorder]}>
      <View style={styles.quietIconOrb}>
        <Icon
          name={slot.active ? 'nights-stay' : 'do-not-disturb-on'}
          size={20}
          color={slot.active ? colors.primary : colors.textMuted}
        />
      </View>
      <View style={styles.quietText}>
        <Text style={styles.quietLabel}>{slot.label}</Text>
        <Text style={styles.quietTime}>{slot.time}</Text>
      </View>
      <AnimatedToggle
        value={slot.active}
        onValueChange={(v) => onToggle(slot.id, v)}
      />
    </View>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────── */

const NotificationSettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  /* State */
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [quietHours, setQuietHours] = useState(INITIAL_QUIET_HOURS);
  const [selectedDelivery, setSelectedDelivery] = useState<Set<string>>(
    new Set(['push', 'email'])
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [badgeEnabled, setBadgeEnabled] = useState(true);
  const [previewEnabled, setPreviewEnabled] = useState(true);

  const scrollBottomPad = useMemo(
    () => getFloatingTabBarBottomPadding(insets.bottom),
    [insets.bottom]
  );

  /* Handlers */
  const toggleCategory = useCallback((id: string, value: boolean) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: value } : c))
    );
  }, []);

  const toggleQuietHour = useCallback((id: string, value: boolean) => {
    setQuietHours((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: value } : s))
    );
  }, []);

  const toggleDelivery = useCallback((id: string) => {
    setSelectedDelivery((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleMaster = useCallback((v: boolean) => {
    setMasterEnabled(v);
  }, []);

  const enabledCount = categories.filter((c) => c.enabled).length;

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      if (Platform.OS === 'android') {
        RNStatusBar.setTranslucent(true);
        RNStatusBar.setBackgroundColor('transparent');
      }
      return () => {
        setStatusBarStyle('dark');
        if (Platform.OS === 'android') {
          RNStatusBar.setTranslucent(false);
          RNStatusBar.setBackgroundColor(colors.background);
        }
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <AppGradientHeader
        title="Notifications"
        subtitle="Manage your alerts"
        leadingMode="back"
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPad },
        ]}
      >
        {/* ── Master toggle card ───────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={styles.masterCard}>
            <View style={styles.masterRow}>
              <View style={styles.masterIconWrap}>
                <View
                  style={[
                    styles.masterIconOrb,
                    masterEnabled
                      ? styles.masterOrbActive
                      : styles.masterOrbInactive,
                  ]}
                >
                  <Icon
                    name={
                      masterEnabled
                        ? 'notifications-active'
                        : 'notifications-off'
                    }
                    size={28}
                    color={masterEnabled ? colors.surface : colors.textMuted}
                  />
                </View>
              </View>
              <View style={styles.masterText}>
                <Text style={styles.masterTitle}>
                  {masterEnabled
                    ? 'Notifications are on'
                    : 'Notifications are off'}
                </Text>
                <Text style={styles.masterSubtitle}>
                  {masterEnabled
                    ? `${enabledCount} of ${categories.length} categories active`
                    : 'You won\'t receive any notifications'}
                </Text>
              </View>
              <AnimatedToggle
                value={masterEnabled}
                onValueChange={toggleMaster}
              />
            </View>
          </Card>
        </Animated.View>

        {masterEnabled && (
          <>
            {/* ── Categories card ────────────────────────────────── */}
            <Animated.View
              entering={FadeInDown.delay(80)
                .springify()
                .damping(18)
                .stiffness(220)}
            >
              <Card variant="elevated" style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionEyebrow}>Categories</Text>
                    <Text style={styles.sectionTitle}>
                      What to notify
                    </Text>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {enabledCount}/{categories.length}
                    </Text>
                  </View>
                </View>
                {categories.map((cat, i) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    index={i}
                    isLast={i === categories.length - 1}
                    onToggle={toggleCategory}
                  />
                ))}
              </Card>
            </Animated.View>

            {/* ── Delivery methods card ──────────────────────────── */}
            <Animated.View
              entering={FadeInDown.delay(140)
                .springify()
                .damping(18)
                .stiffness(220)}
            >
              <Card variant="elevated" style={styles.sectionCard}>
                <Text style={styles.sectionEyebrow}>Delivery</Text>
                <Text style={[styles.sectionTitle, { marginBottom: spacing.md }]}>
                  How to reach you
                </Text>
                <View style={styles.deliveryRow}>
                  {DELIVERY_OPTIONS.map((opt, i) => (
                    <DeliveryChip
                      key={opt.id}
                      option={opt}
                      index={i}
                      selected={selectedDelivery.has(opt.id)}
                      onPress={() => toggleDelivery(opt.id)}
                    />
                  ))}
                </View>
              </Card>
            </Animated.View>

            {/* ── Sound & haptics card ───────────────────────────── */}
            <Animated.View
              entering={FadeInDown.delay(200)
                .springify()
                .damping(18)
                .stiffness(220)}
            >
              <Card variant="elevated" style={styles.sectionCard}>
                <Text style={styles.sectionEyebrow}>Alerts</Text>
                <Text
                  style={[styles.sectionTitle, { marginBottom: spacing.sm }]}
                >
                  Sound & haptics
                </Text>
                <SettingToggle
                  icon="volume-up"
                  iconBg={colors.skySoft}
                  iconColor={colors.info}
                  label="Sound"
                  sublabel="Play notification sounds"
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                />
                <SettingToggle
                  icon="vibration"
                  iconBg={colors.peachSoft}
                  iconColor={colors.accent}
                  label="Vibration"
                  sublabel="Haptic feedback on alerts"
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  borderBottom
                />
                <SettingToggle
                  icon="circle-notifications"
                  iconBg={colors.mintSoft}
                  iconColor={colors.growth}
                  label="Badge count"
                  sublabel="Show unread count on app icon"
                  value={badgeEnabled}
                  onValueChange={setBadgeEnabled}
                  borderBottom
                />
                <SettingToggle
                  icon="visibility"
                  iconBg={colors.lavenderSoft}
                  iconColor={colors.primary}
                  label="Preview"
                  sublabel="Show message preview on lock screen"
                  value={previewEnabled}
                  onValueChange={setPreviewEnabled}
                  isLast
                />
              </Card>
            </Animated.View>

            {/* ── Quiet Hours card ───────────────────────────────── */}
            <Animated.View
              entering={FadeInDown.delay(260)
                .springify()
                .damping(18)
                .stiffness(220)}
            >
              <Card variant="elevated" style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionEyebrow}>Schedule</Text>
                    <Text style={styles.sectionTitle}>Quiet hours</Text>
                  </View>
                  <View style={styles.quietBadge}>
                    <Icon name="bedtime" size={16} color={colors.primary} />
                  </View>
                </View>
                <Text style={styles.quietDescription}>
                  Silence notifications during these time windows. Critical alerts will still come through.
                </Text>
                {quietHours.map((slot, i) => (
                  <QuietHourRow
                    key={slot.id}
                    slot={slot}
                    isLast={i === quietHours.length - 1}
                    onToggle={toggleQuietHour}
                  />
                ))}
              </Card>
            </Animated.View>

            {/* ── Footer note ────────────────────────────────────── */}
            <Animated.View
              entering={FadeInDown.delay(320)
                .springify()
                .damping(18)
                .stiffness(220)}
            >
              <View style={styles.footerNote}>
                <Icon name="info-outline" size={16} color={colors.textMuted} />
                <Text style={styles.footerNoteText}>
                  You can also manage notification permissions in your device's system settings.
                </Text>
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/* ─── Reusable setting toggle row ────────────────────────────────────── */

function SettingToggle({
  icon,
  iconBg,
  iconColor,
  label,
  sublabel,
  value,
  onValueChange,
  isLast = false,
  borderBottom = false,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  sublabel: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  isLast?: boolean;
  borderBottom?: boolean;
}) {
  return (
    <View
      style={[
        styles.settingToggleRow,
        !isLast && styles.settingToggleBorder,
      ]}
    >
      <View style={[styles.settingToggleIcon, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.settingToggleText}>
        <Text style={styles.settingToggleLabel}>{label}</Text>
        <Text style={styles.settingToggleSub}>{sublabel}</Text>
      </View>
      <AnimatedToggle value={value} onValueChange={onValueChange} />
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  /* Master toggle */
  masterCard: {
    marginVertical: spacing.xs,
  },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterIconWrap: {
    marginRight: spacing.md,
  },
  masterIconOrb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterOrbActive: {
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  masterOrbInactive: {
    backgroundColor: colors.surfaceMuted,
  },
  masterText: {
    flex: 1,
    minWidth: 0,
  },
  masterTitle: {
    ...textStyles.headingMedium,
    fontWeight: '800',
    color: colors.ink,
    fontSize: 17,
  },
  masterSubtitle: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },

  /* Section cards */
  sectionCard: {
    marginVertical: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionEyebrow: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...textStyles.headingMedium,
    fontWeight: '800',
    color: colors.ink,
  },
  countBadge: {
    backgroundColor: colors.lavenderSoft,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(124, 106, 232, 0.18)',
  },
  countBadgeText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.primaryDark,
  },

  /* Category rows */
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  categoryRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  categoryIconOrb: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  categoryText: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.sm,
  },
  categoryTitle: {
    ...textStyles.bodyLarge,
    fontWeight: '700',
    color: colors.ink,
  },
  categoryDesc: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  disabledText: {
    opacity: 0.5,
  },

  /* Delivery chips */
  deliveryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  deliveryChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.large,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  deliveryChipActive: {
    backgroundColor: colors.lavenderSoft,
    borderColor: colors.primary,
  },
  deliveryChipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  deliveryChipIconActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  deliveryChipLabel: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },
  deliveryChipLabelActive: {
    color: colors.primaryDark,
  },
  deliveryChipSub: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs - 1,
    fontWeight: '500',
    color: colors.textMuted,
  },
  deliveryChipSubActive: {
    color: colors.textSecondary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  /* Setting toggle row */
  settingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingToggleBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  settingToggleIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingToggleText: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.sm,
  },
  settingToggleLabel: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
    color: colors.ink,
    fontSize: 15,
  },
  settingToggleSub: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },

  /* Quiet hours */
  quietBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.lavenderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quietDescription: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  quietRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  quietRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  quietIconOrb: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  quietText: {
    flex: 1,
    minWidth: 0,
  },
  quietLabel: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
    color: colors.ink,
    fontSize: 15,
  },
  quietTime: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },

  /* Footer */
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  footerNoteText: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },

  pressedOpacity: {
    opacity: 0.88,
  },
});

export default NotificationSettingsScreen;
