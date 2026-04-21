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
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
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

/* ─── Toggle ────────────────────────────────────────────────────────── */

function AnimatedToggle({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.surfaceMuted, true: colors.primary }}
      thumbColor={value ? colors.surface : '#E8E4FF'}
      ios_backgroundColor={colors.surfaceMuted}
      style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
    />
  );
}

/* ─── Types ──────────────────────────────────────────────────────────── */

type PrivacyRow = {
  id: string;
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  iconColor: string;
  iconBg: string;
};

type SecurityAction = {
  id: string;
  icon: string;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
  actionIcon?: string;
};

/* ─── Static data ────────────────────────────────────────────────────── */

const INITIAL_PRIVACY: PrivacyRow[] = [
  {
    id: 'analytics_tracking',
    icon: 'analytics',
    title: 'Usage Analytics',
    description: 'Help improve Kovariya by sharing anonymous usage data',
    enabled: true,
    iconColor: colors.primary,
    iconBg: colors.lavenderSoft,
  },
  {
    id: 'crash_reports',
    icon: 'bug-report',
    title: 'Crash Reports',
    description: 'Automatically send crash reports for better stability',
    enabled: true,
    iconColor: colors.info,
    iconBg: colors.skySoft,
  },
  {
    id: 'personalized_tips',
    icon: 'lightbulb',
    title: 'Personalized Tips',
    description: 'Receive tips based on your child\'s activity patterns',
    enabled: true,
    iconColor: colors.accent,
    iconBg: colors.peachSoft,
  },
  {
    id: 'visible_profile',
    icon: 'visibility',
    title: 'Visible Profile',
    description: 'Allow other family members to find and connect with you',
    enabled: false,
    iconColor: colors.growth,
    iconBg: colors.mintSoft,
  },
  {
    id: 'share_progress',
    icon: 'share',
    title: 'Share Progress',
    description: 'Allow teachers to view your child\'s weekly progress',
    enabled: true,
    iconColor: '#E85D5D',
    iconBg: '#FFECEC',
  },
];

const SECURITY_ACTIONS: SecurityAction[] = [
  {
    id: 'change_pin',
    icon: 'pin',
    title: 'Change PIN',
    description: 'Update your 4-digit security PIN',
    iconColor: colors.primary,
    iconBg: colors.lavenderSoft,
    actionIcon: 'chevron-right',
  },
  {
    id: 'change_password',
    icon: 'lock',
    title: 'Change Password',
    description: 'Update your account password',
    iconColor: colors.info,
    iconBg: colors.skySoft,
    actionIcon: 'chevron-right',
  },
  {
    id: 'biometric',
    icon: 'fingerprint',
    title: 'Biometric Login',
    description: 'Use fingerprint or face ID to log in',
    iconColor: colors.growth,
    iconBg: colors.mintSoft,
  },
  {
    id: 'two_factor',
    icon: 'verified-user',
    title: 'Two-Factor Auth',
    description: 'Add an extra layer of security to your account',
    iconColor: colors.accent,
    iconBg: colors.peachSoft,
  },
];

const DATA_ACTIONS: SecurityAction[] = [
  {
    id: 'download_data',
    icon: 'cloud-download',
    title: 'Download My Data',
    description: 'Get a copy of all your data in a portable format',
    iconColor: colors.info,
    iconBg: colors.skySoft,
    actionIcon: 'chevron-right',
  },
  {
    id: 'delete_account',
    icon: 'delete-forever',
    title: 'Delete Account',
    description: 'Permanently delete your account and all data',
    iconColor: '#E85D5D',
    iconBg: '#FFECEC',
    actionIcon: 'chevron-right',
  },
];

/* ─── Main Screen ────────────────────────────────────────────────────── */

const PrivacySecurityScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [privacySettings, setPrivacySettings] = useState(INITIAL_PRIVACY);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const scrollBottomPad = useMemo(
    () => getFloatingTabBarBottomPadding(insets.bottom),
    [insets.bottom]
  );

  const togglePrivacy = useCallback((id: string, value: boolean) => {
    setPrivacySettings((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: value } : p))
    );
  }, []);

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
    <SafeAreaView style={s.root} edges={['left', 'right', 'bottom']}>
      <AppGradientHeader
        title="Privacy & Security"
        subtitle="Control your data"
        leadingMode="back"
      />

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingBottom: scrollBottomPad }]}
      >
        {/* ── Security shield status ────────────────────────────── */}
        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <Card variant="elevated" style={s.shieldCard}>
            <View style={s.shieldRow}>
              <View style={s.shieldOrb}>
                <Icon name="shield" size={32} color={colors.surface} />
              </View>
              <View style={s.shieldText}>
                <Text style={s.shieldTitle}>Account Protected</Text>
                <Text style={s.shieldSubtitle}>
                  Your security score is excellent
                </Text>
              </View>
              <View style={s.shieldBadge}>
                <Text style={s.shieldBadgeText}>98%</Text>
              </View>
            </View>
            <View style={s.shieldBarTrack}>
              <View style={[s.shieldBarFill, { width: '98%' }]} />
            </View>
          </Card>
        </Animated.View>

        {/* ── Privacy toggles ───────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(80).springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={s.sectionCard}>
            <Text style={s.sectionEyebrow}>Privacy</Text>
            <Text style={[s.sectionTitle, { marginBottom: spacing.sm }]}>
              Data & sharing
            </Text>
            {privacySettings.map((row, i) => (
              <Animated.View
                key={row.id}
                entering={FadeInRight.delay(60 * i).springify().damping(20).stiffness(180)}
              >
                <View
                  style={[
                    s.privacyRow,
                    i < privacySettings.length - 1 && s.privacyRowBorder,
                  ]}
                >
                  <View style={[s.iconOrb, { backgroundColor: row.iconBg }]}>
                    <Icon name={row.icon} size={22} color={row.iconColor} />
                  </View>
                  <View style={s.rowText}>
                    <Text style={[s.rowTitle, !row.enabled && s.disabledText]}>
                      {row.title}
                    </Text>
                    <Text style={[s.rowDesc, !row.enabled && s.disabledText]} numberOfLines={2}>
                      {row.description}
                    </Text>
                  </View>
                  <AnimatedToggle
                    value={row.enabled}
                    onValueChange={(v) => togglePrivacy(row.id, v)}
                  />
                </View>
              </Animated.View>
            ))}
          </Card>
        </Animated.View>

        {/* ── Security ──────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(160).springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={s.sectionCard}>
            <Text style={s.sectionEyebrow}>Security</Text>
            <Text style={[s.sectionTitle, { marginBottom: spacing.sm }]}>
              Authentication
            </Text>
            {SECURITY_ACTIONS.map((action, i) => {
              const isToggle = action.id === 'biometric' || action.id === 'two_factor';
              return (
                <Pressable
                  key={action.id}
                  style={({ pressed }) => [
                    s.privacyRow,
                    i < SECURITY_ACTIONS.length - 1 && s.privacyRowBorder,
                    pressed && !isToggle && s.pressedOpacity,
                  ]}
                  disabled={isToggle}
                  accessibilityRole="button"
                  accessibilityLabel={action.title}
                >
                  <View style={[s.iconOrb, { backgroundColor: action.iconBg }]}>
                    <Icon name={action.icon} size={22} color={action.iconColor} />
                  </View>
                  <View style={s.rowText}>
                    <Text style={s.rowTitle}>{action.title}</Text>
                    <Text style={s.rowDesc} numberOfLines={2}>{action.description}</Text>
                  </View>
                  {isToggle ? (
                    <AnimatedToggle
                      value={action.id === 'biometric' ? biometricEnabled : twoFactorEnabled}
                      onValueChange={action.id === 'biometric' ? setBiometricEnabled : setTwoFactorEnabled}
                    />
                  ) : (
                    <Icon name="chevron-right" size={22} color={colors.textMuted} />
                  )}
                </Pressable>
              );
            })}
          </Card>
        </Animated.View>

        {/* ── Your data ─────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(240).springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={s.sectionCard}>
            <Text style={s.sectionEyebrow}>Your Data</Text>
            <Text style={[s.sectionTitle, { marginBottom: spacing.sm }]}>
              Data management
            </Text>
            {DATA_ACTIONS.map((action, i) => (
              <Pressable
                key={action.id}
                style={({ pressed }) => [
                  s.privacyRow,
                  i < DATA_ACTIONS.length - 1 && s.privacyRowBorder,
                  pressed && s.pressedOpacity,
                ]}
                accessibilityRole="button"
                accessibilityLabel={action.title}
              >
                <View style={[s.iconOrb, { backgroundColor: action.iconBg }]}>
                  <Icon name={action.icon} size={22} color={action.iconColor} />
                </View>
                <View style={s.rowText}>
                  <Text
                    style={[
                      s.rowTitle,
                      action.id === 'delete_account' && { color: '#E85D5D' },
                    ]}
                  >
                    {action.title}
                  </Text>
                  <Text style={s.rowDesc} numberOfLines={2}>{action.description}</Text>
                </View>
                <Icon name="chevron-right" size={22} color={colors.textMuted} />
              </Pressable>
            ))}
          </Card>
        </Animated.View>

        {/* ── Last login info ───────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(300).springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={s.loginCard}>
            <View style={s.loginRow}>
              <Icon name="access-time" size={18} color={colors.textMuted} />
              <View style={s.loginText}>
                <Text style={s.loginLabel}>Last login</Text>
                <Text style={s.loginValue}>Today at 9:15 AM · Android</Text>
              </View>
            </View>
            <View style={[s.loginRow, { borderBottomWidth: 0 }]}>
              <Icon name="devices" size={18} color={colors.textMuted} />
              <View style={s.loginText}>
                <Text style={s.loginLabel}>Active sessions</Text>
                <Text style={s.loginValue}>1 device</Text>
              </View>
              <Pressable
                style={({ pressed }) => [s.manageBtn, pressed && s.pressedOpacity]}
                accessibilityRole="button"
                accessibilityLabel="Manage sessions"
              >
                <Text style={s.manageBtnText}>Manage</Text>
              </Pressable>
            </View>
          </Card>
        </Animated.View>

        {/* ── Footer ────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(360).springify().damping(18).stiffness(220)}
        >
          <View style={s.footerNote}>
            <Icon name="info-outline" size={16} color={colors.textMuted} />
            <Text style={s.footerNoteText}>
              Your data is encrypted and stored securely. Read our{' '}
              <Text style={s.footerLink}>Privacy Policy</Text> for more details.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

/* ─── Styles ─────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },

  /* Shield */
  shieldCard: { marginVertical: spacing.xs },
  shieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  shieldOrb: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.growth,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
    ...Platform.select({
      ios: { shadowColor: colors.growth, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  shieldText: { flex: 1, minWidth: 0 },
  shieldTitle: { ...textStyles.headingMedium, fontWeight: '800', color: colors.ink, fontSize: 17 },
  shieldSubtitle: { ...textStyles.caption, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  shieldBadge: {
    backgroundColor: colors.mintSoft, paddingHorizontal: spacing.sm + 2, paddingVertical: 6,
    borderRadius: borderRadius.full, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(63, 169, 122, 0.2)',
  },
  shieldBadgeText: {
    fontFamily: typography.fontFamily.primary, fontSize: typography.fontSize.sm,
    fontWeight: '800', color: colors.growth,
  },
  shieldBarTrack: {
    height: 6, borderRadius: 3, backgroundColor: colors.surfaceMuted, overflow: 'hidden',
  },
  shieldBarFill: {
    height: '100%', borderRadius: 3, backgroundColor: colors.growth,
  },

  /* Sections */
  sectionCard: { marginVertical: spacing.xs },
  sectionEyebrow: {
    fontFamily: typography.fontFamily.primary, fontSize: typography.fontSize.xs,
    fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase',
    color: colors.textMuted, marginBottom: spacing.sm,
  },
  sectionTitle: { ...textStyles.headingMedium, fontWeight: '800', color: colors.ink },

  /* Rows */
  privacyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  privacyRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  iconOrb: {
    width: 44, height: 44, borderRadius: borderRadius.medium,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  rowText: { flex: 1, minWidth: 0, marginRight: spacing.sm },
  rowTitle: { ...textStyles.bodyLarge, fontWeight: '700', color: colors.ink },
  rowDesc: { ...textStyles.caption, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  disabledText: { opacity: 0.5 },

  /* Login card */
  loginCard: { marginVertical: spacing.xs },
  loginRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  loginText: { flex: 1, marginLeft: spacing.md },
  loginLabel: { ...textStyles.bodyLarge, fontWeight: '600', color: colors.ink, fontSize: 15 },
  loginValue: { ...textStyles.caption, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  manageBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: borderRadius.full, backgroundColor: colors.lavenderSoft,
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(124, 106, 232, 0.18)',
  },
  manageBtnText: {
    fontFamily: typography.fontFamily.primary, fontSize: typography.fontSize.xs,
    fontWeight: '700', color: colors.primaryDark,
  },

  /* Footer */
  footerNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.xs,
  },
  footerNoteText: { ...textStyles.caption, color: colors.textMuted, fontWeight: '500', flex: 1, lineHeight: 18 },
  footerLink: { color: colors.primary, fontWeight: '700' },

  pressedOpacity: { opacity: 0.88 },
});

export default PrivacySecurityScreen;
