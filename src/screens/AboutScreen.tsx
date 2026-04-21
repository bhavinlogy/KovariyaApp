import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar as RNStatusBar,
  Linking,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppGradientHeader, Card } from '../components';
import {
  colors,
  spacing,
  textStyles,
  getFloatingTabBarBottomPadding,
  borderRadius,
  typography,
} from '../theme';
import { GRADIENT_60_END } from '../theme/layout';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';

/* ─── Types ──────────────────────────────────────────────────────────── */

type AppInfoRow = {
  id: string;
  label: string;
  value: string;
  icon: string;
  iconColor: string;
  iconBg: string;
};

type LegalLink = {
  id: string;
  icon: string;
  title: string;
  iconColor: string;
  iconBg: string;
};

type SocialLink = {
  id: string;
  icon: string;
  label: string;
  color: string;
  bg: string;
};

/* ─── Static data ────────────────────────────────────────────────────── */

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '2026.04.20';

const APP_INFO: AppInfoRow[] = [
  {
    id: 'version',
    label: 'Version',
    value: `v${APP_VERSION}`,
    icon: 'info',
    iconColor: colors.primary,
    iconBg: colors.lavenderSoft,
  },
  {
    id: 'build',
    label: 'Build',
    value: BUILD_NUMBER,
    icon: 'build',
    iconColor: colors.info,
    iconBg: colors.skySoft,
  },
  {
    id: 'platform',
    label: 'Platform',
    value: Platform.OS === 'ios' ? 'iOS' : 'Android',
    icon: Platform.OS === 'ios' ? 'phone-iphone' : 'phone-android',
    iconColor: colors.growth,
    iconBg: colors.mintSoft,
  },
  {
    id: 'sdk',
    label: 'React Native',
    value: '0.76',
    icon: 'code',
    iconColor: colors.accent,
    iconBg: colors.peachSoft,
  },
];

const LEGAL_LINKS: LegalLink[] = [
  {
    id: 'privacy_policy',
    icon: 'policy',
    title: 'Privacy Policy',
    iconColor: colors.primary,
    iconBg: colors.lavenderSoft,
  },
  {
    id: 'terms',
    icon: 'description',
    title: 'Terms of Service',
    iconColor: colors.info,
    iconBg: colors.skySoft,
  },
  {
    id: 'licenses',
    icon: 'receipt-long',
    title: 'Open Source Licenses',
    iconColor: colors.growth,
    iconBg: colors.mintSoft,
  },
  {
    id: 'data_policy',
    icon: 'storage',
    title: 'Data Processing Agreement',
    iconColor: colors.accent,
    iconBg: colors.peachSoft,
  },
];

const FEATURES: { icon: string; title: string; desc: string; color: string; bg: string }[] = [
  {
    icon: 'star',
    title: 'Daily Ratings',
    desc: 'Track your child\'s daily progress across multiple aspects',
    color: colors.accent,
    bg: colors.peachSoft,
  },
  {
    icon: 'analytics',
    title: 'Smart Analytics',
    desc: 'AI-powered insights and comprehensive progress reports',
    color: colors.primary,
    bg: colors.lavenderSoft,
  },
  {
    icon: 'emoji-events',
    title: 'Goals & Missions',
    desc: 'Set meaningful goals and complete engaging missions',
    color: colors.growth,
    bg: colors.mintSoft,
  },
  {
    icon: 'groups',
    title: 'Family Connect',
    desc: 'Connect with teachers and school communities',
    color: colors.info,
    bg: colors.skySoft,
  },
];

const SOCIAL_LINKS: SocialLink[] = [
  { id: 'twitter', icon: 'share', label: 'Twitter', color: '#1DA1F2', bg: '#E8F5FE' },
  { id: 'instagram', icon: 'camera-alt', label: 'Instagram', color: '#E4405F', bg: '#FFECEF' },
  { id: 'website', icon: 'language', label: 'Website', color: colors.primary, bg: colors.lavenderSoft },
];

/* ─── Team member badge ──────────────────────────────────────────────── */

function TeamAvatarStack() {
  const team = ['BL', 'AK', 'SP', 'MR'];
  const teamColors = [colors.lavenderSoft, colors.skySoft, colors.mintSoft, colors.peachSoft];

  return (
    <View style={s.teamStack}>
      {team.map((initials, i) => (
        <View
          key={initials}
          style={[
            s.teamAvatar,
            { backgroundColor: teamColors[i], marginLeft: i > 0 ? -10 : 0, zIndex: team.length - i },
          ]}
        >
          <Text style={s.teamAvatarText}>{initials}</Text>
        </View>
      ))}
    </View>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────── */

const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const scrollBottomPad = useMemo(
    () => getFloatingTabBarBottomPadding(insets.bottom),
    [insets.bottom]
  );

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
      <AppGradientHeader title="About" subtitle="App info & legal" leadingMode="back" />

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingBottom: scrollBottomPad }]}
      >
        {/* ── Hero / Brand card ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <Card variant="elevated" style={s.heroCard} padding={0}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={GRADIENT_60_END}
              style={s.heroBg}
            >
              {/* Decorative orbs */}
              <View style={s.heroOrbs} pointerEvents="none">
                <View style={s.heroOrbLarge} />
                <View style={s.heroOrbSmall} />
              </View>
              <Animated.View
                entering={ZoomIn.delay(200).springify().damping(14).stiffness(120)}
              >
                <View style={s.logoOrb}>
                  <Text style={s.logoText}>K</Text>
                </View>
              </Animated.View>
              <Text style={s.heroTitle}>Kovariya</Text>
              <Text style={s.heroSubtitle}>Smart parenting. Better children.</Text>
              <View style={s.versionPill}>
                <Text style={s.versionPillText}>v{APP_VERSION}</Text>
              </View>
            </LinearGradient>
          </Card>
        </Animated.View>

        {/* ── App info ──────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(80).springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={s.sectionCard}>
            <Text style={s.sectionEyebrow}>App Info</Text>
            <Text style={[s.sectionTitle, { marginBottom: spacing.sm }]}>
              Technical details
            </Text>
            {APP_INFO.map((row, i) => (
              <View
                key={row.id}
                style={[s.infoRow, i < APP_INFO.length - 1 && s.infoRowBorder]}
              >
                <View style={[s.iconOrb, { backgroundColor: row.iconBg }]}>
                  <Icon name={row.icon} size={20} color={row.iconColor} />
                </View>
                <Text style={s.infoLabel}>{row.label}</Text>
                <View style={s.infoBadge}>
                  <Text style={s.infoBadgeText}>{row.value}</Text>
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* ── Features ──────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(160).springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={s.sectionCard}>
            <Text style={s.sectionEyebrow}>Features</Text>
            <Text style={[s.sectionTitle, { marginBottom: spacing.sm }]}>
              What Kovariya offers
            </Text>
            {FEATURES.map((f, i) => (
              <Animated.View
                key={f.title}
                entering={FadeInRight.delay(60 * i).springify().damping(20).stiffness(180)}
              >
                <View style={[s.featureRow, i < FEATURES.length - 1 && s.featureRowBorder]}>
                  <View style={[s.iconOrb, { backgroundColor: f.bg }]}>
                    <Icon name={f.icon} size={22} color={f.color} />
                  </View>
                  <View style={s.featureText}>
                    <Text style={s.featureTitle}>{f.title}</Text>
                    <Text style={s.featureDesc} numberOfLines={2}>{f.desc}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </Card>
        </Animated.View>

        {/* ── Legal ─────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(240).springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={s.sectionCard}>
            <Text style={s.sectionEyebrow}>Legal</Text>
            <Text style={[s.sectionTitle, { marginBottom: spacing.sm }]}>
              Policies & licenses
            </Text>
            {LEGAL_LINKS.map((link, i) => (
              <Pressable
                key={link.id}
                style={({ pressed }) => [
                  s.legalRow,
                  i < LEGAL_LINKS.length - 1 && s.legalRowBorder,
                  pressed && s.pressedOpacity,
                ]}
                accessibilityRole="button"
                accessibilityLabel={link.title}
              >
                <View style={[s.iconOrb, { backgroundColor: link.iconBg }]}>
                  <Icon name={link.icon} size={22} color={link.iconColor} />
                </View>
                <Text style={s.legalTitle}>{link.title}</Text>
                <Icon name="chevron-right" size={22} color={colors.textMuted} />
              </Pressable>
            ))}
          </Card>
        </Animated.View>

        {/* ── Team / Credits ────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(320).springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={s.sectionCard}>
            <Text style={s.sectionEyebrow}>Team</Text>
            <Text style={[s.sectionTitle, { marginBottom: spacing.md }]}>
              Made with ❤️
            </Text>
            <View style={s.teamRow}>
              <TeamAvatarStack />
              <View style={s.teamInfo}>
                <Text style={s.teamInfoText}>
                  Built by a team of passionate engineers and designers who believe every child deserves the best start in life.
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* ── Social links ──────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(380).springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={s.sectionCard}>
            <Text style={s.sectionEyebrow}>Follow Us</Text>
            <Text style={[s.sectionTitle, { marginBottom: spacing.md }]}>
              Stay connected
            </Text>
            <View style={s.socialRow}>
              {SOCIAL_LINKS.map((social) => (
                <Pressable
                  key={social.id}
                  style={({ pressed }) => [
                    s.socialChip,
                    pressed && s.pressedOpacity,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={social.label}
                >
                  <View style={[s.socialIcon, { backgroundColor: social.bg }]}>
                    <Icon name={social.icon} size={22} color={social.color} />
                  </View>
                  <Text style={s.socialLabel}>{social.label}</Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* ── Footer ────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(440).springify().damping(18).stiffness(220)}
        >
          <View style={s.footer}>
            <Text style={s.footerText}>
              © 2024–2026 Kovariya Technologies Pvt. Ltd.
            </Text>
            <Text style={s.footerSubtext}>All rights reserved.</Text>
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

  /* Hero */
  heroCard: { marginVertical: spacing.xs, overflow: 'hidden' },
  heroBg: {
    alignItems: 'center', paddingVertical: spacing.xl + spacing.md,
    paddingHorizontal: spacing.lg, position: 'relative',
  },
  heroOrbs: { ...StyleSheet.absoluteFillObject },
  heroOrbLarge: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', top: -60, right: -40,
  },
  heroOrbSmall: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(232, 228, 255, 0.15)', bottom: 20, left: 30,
  },
  logoOrb: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
    borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  logoText: {
    fontFamily: typography.fontFamily.primary, fontSize: 36,
    fontWeight: '900', color: colors.surface, letterSpacing: -1,
  },
  heroTitle: {
    ...textStyles.headingLarge, fontWeight: '900', color: colors.surface,
    fontSize: 26, letterSpacing: -0.5, marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...textStyles.bodyMedium, color: 'rgba(255,255,255,0.78)', fontWeight: '500',
    marginBottom: spacing.md,
  },
  versionPill: {
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: borderRadius.full, backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  versionPillText: {
    fontFamily: typography.fontFamily.primary, fontSize: typography.fontSize.xs,
    fontWeight: '700', color: colors.surface,
  },

  /* Sections */
  sectionCard: { marginVertical: spacing.xs },
  sectionEyebrow: {
    fontFamily: typography.fontFamily.primary, fontSize: typography.fontSize.xs,
    fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase',
    color: colors.textMuted, marginBottom: spacing.sm,
  },
  sectionTitle: { ...textStyles.headingMedium, fontWeight: '800', color: colors.ink },

  /* App info */
  infoRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md,
  },
  infoRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  iconOrb: {
    width: 40, height: 40, borderRadius: borderRadius.small,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  infoLabel: {
    ...textStyles.bodyLarge, fontWeight: '600', color: colors.ink, flex: 1,
  },
  infoBadge: {
    paddingHorizontal: spacing.sm + 2, paddingVertical: 5,
    borderRadius: borderRadius.full, backgroundColor: colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  infoBadgeText: {
    fontFamily: typography.fontFamily.primary, fontSize: typography.fontSize.xs,
    fontWeight: '700', color: colors.textSecondary,
  },

  /* Features */
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  featureRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  featureText: { flex: 1, minWidth: 0 },
  featureTitle: { ...textStyles.bodyLarge, fontWeight: '700', color: colors.ink },
  featureDesc: { ...textStyles.caption, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },

  /* Legal */
  legalRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md,
  },
  legalRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  legalTitle: { ...textStyles.bodyLarge, fontWeight: '700', color: colors.ink, flex: 1 },

  /* Team */
  teamRow: { flexDirection: 'row', alignItems: 'center' },
  teamStack: { flexDirection: 'row', marginRight: spacing.md },
  teamAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: colors.surface,
  },
  teamAvatarText: {
    fontFamily: typography.fontFamily.primary, fontSize: 13,
    fontWeight: '800', color: colors.primaryDark,
  },
  teamInfo: { flex: 1 },
  teamInfoText: {
    ...textStyles.bodyMedium, color: colors.textSecondary, fontWeight: '500', lineHeight: 20,
  },

  /* Social */
  socialRow: { flexDirection: 'row', gap: spacing.sm },
  socialChip: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.md,
    borderRadius: borderRadius.large, backgroundColor: colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
  },
  socialIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  socialLabel: {
    fontFamily: typography.fontFamily.primary, fontSize: typography.fontSize.sm,
    fontWeight: '700', color: colors.ink,
  },

  /* Footer */
  footer: { alignItems: 'center', paddingVertical: spacing.xl, paddingBottom: spacing.sm },
  footerText: { ...textStyles.caption, color: colors.textMuted, fontWeight: '600' },
  footerSubtext: {
    ...textStyles.caption, color: colors.textMuted, marginTop: spacing.xs,
    fontWeight: '500', fontStyle: 'italic',
  },

  pressedOpacity: { opacity: 0.88 },
});

export default AboutScreen;
