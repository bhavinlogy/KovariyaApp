import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';

const { width: SW } = Dimensions.get('window');

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', flag: '🇸🇬', name: 'SG' },
];

// ─── Illustration Card ────────────────────────────────────────────────────────
const IllustrationCard = () => (
  <View style={styles.illusCard}>
    <Text style={styles.childEmoji}>👦</Text>
    <View style={styles.illusTextBox}>
      <Text style={styles.illusTitle}>Welcome to Kovariya</Text>
      <Text style={styles.illusSub}>Smart parenting, calmer days</Text>
    </View>
  </View>
);

// ─── OTP Input Row ────────────────────────────────────────────────────────────
const OtpBox = ({ index, value, focused }: { index: number; value: string; focused: boolean }) => {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (value) {
      scale.value = withSequence(withSpring(1.1, { damping: 18 }), withSpring(1, { damping: 18 }));
    }
  }, [value]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      style={[
        styles.otpBox,
        focused && styles.otpBoxFocused,
        value && styles.otpBoxFilled,
        style,
      ]}
    >
      <Text style={styles.otpDigit}>{value || ''}</Text>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
interface Props {
  navigation: any;
}

export function OnboardingScreen1({ navigation }: Props) {
  const [tab, setTab] = useState<'school' | 'direct'>('school');
  const [schoolId, setSchoolId] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [mobile, setMobile] = useState('');
  const [showCCPicker, setShowCCPicker] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedOtp, setFocusedOtp] = useState(0);
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const otpRefs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

  const mainX = useSharedValue(0);
  const otpX = useSharedValue(SW);

  const mainStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: mainX.value }],
    opacity: interpolate(mainX.value, [-SW, 0], [0, 1]),
  }));
  const otpStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: otpX.value }],
    opacity: interpolate(otpX.value, [0, SW], [1, 0]),
    position: 'absolute',
    width: '100%',
  }));

  // Timer countdown
  useEffect(() => {
    if (!timerActive) return;
    if (timer <= 0) { setTimerActive(false); return; }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, timerActive]);

  const switchTab = (t: 'school' | 'direct') => {
    setTab(t);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const transitionToOtp = () => {
    mainX.value = withTiming(-SW, { duration: 360, easing: Easing.inOut(Easing.cubic) });
    otpX.value = withTiming(0, { duration: 360, easing: Easing.inOut(Easing.cubic) });
    setShowOtp(true);
    setTimer(60);
    setTimerActive(true);
    setTimeout(() => otpRefs[0].current?.focus(), 500);
  };

  const handleSendOtp = () => {
    if (sendingOtp) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSendingOtp(true);
    // Simulate OTP sending with 1.5s loader
    setTimeout(() => {
      setSendingOtp(false);
      transitionToOtp();
    }, 1500);
  };

  const handleBack = () => {
    if (showOtp) {
      mainX.value = withTiming(0, { duration: 340, easing: Easing.inOut(Easing.cubic) });
      otpX.value = withTiming(SW, { duration: 340, easing: Easing.inOut(Easing.cubic) });
      setTimeout(() => setShowOtp(false), 400);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // No back on the root screen when not in OTP view
  };

  const handleOtpChange = (text: string, idx: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 3) {
      otpRefs[idx + 1].current?.focus();
      setFocusedOtp(idx + 1);
    }
    if (next.every(d => d !== '') && idx === 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => navigation.navigate('Onboarding2'), 350);
    }
  };

  const handleOtpKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
      setFocusedOtp(idx - 1);
      const next = [...otp]; next[idx - 1] = '';
      setOtp(next);
    }
  };

  const resendOtp = () => {
    setTimer(60);
    setTimerActive(true);
    setOtp(['', '', '', '']);
    otpRefs[0].current?.focus();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button — only visible when in OTP sub-screen */}
          {showOtp && (
            <Pressable style={styles.backBtn} onPress={handleBack}>
              <View style={styles.backCircle}>
                <Icon name="arrow-back" size={20} color={colors.textPrimary} />
              </View>
            </Pressable>
          )}
          {/* Spacer when not showing back button to keep layout consistent */}
          {!showOtp && <View style={styles.backBtnSpacer} />}

          {/* Illustration */}
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <IllustrationCard />
          </Animated.View>

          {/* Relative container for slide transitions */}
          <View style={{ flex: 1 }}>
            {/* Main Form */}
            <Animated.View style={[styles.formBlock, mainStyle]}>
              {/* Tab Toggle */}
              <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.tabContainer}>
                <View style={styles.tabTrack}>
                  <View style={[styles.tabPill, { left: tab === 'school' ? '0%' : '50%' }]} />
                  <Pressable style={styles.tabBtn} onPress={() => switchTab('school')}>
                    <Text style={[styles.tabText, tab === 'school' && styles.tabTextActive]}>Via School</Text>
                  </Pressable>
                  <Pressable style={styles.tabBtn} onPress={() => switchTab('direct')}>
                    <Text style={[styles.tabText, tab === 'direct' && styles.tabTextActive]}>Direct Join</Text>
                  </Pressable>
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.fields}>
                {/* School ID / Code */}
                <View>
                  <Text style={styles.label}>{tab === 'school' ? 'School ID' : 'Unique Code'}</Text>
                  <View style={styles.inputWrap}>
                    <Icon name="business" size={20} color={colors.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder={tab === 'school' ? 'e.g. SCH-20045' : 'Enter your invite code'}
                      placeholderTextColor={colors.textMuted}
                      value={schoolId}
                      onChangeText={setSchoolId}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                {/* Mobile Number */}
                <View>
                  <Text style={styles.label}>Mobile Number</Text>
                  <View style={styles.inputWrap}>
                    <Pressable style={styles.ccChip} onPress={() => setShowCCPicker(!showCCPicker)}>
                      <Text style={styles.ccFlag}>{countryCode.flag}</Text>
                      <Text style={styles.ccCode}>{countryCode.code}</Text>
                      <Icon name="arrow-drop-down" size={18} color={colors.textSecondary} />
                    </Pressable>
                    <View style={styles.divider} />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="9876543210"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="phone-pad"
                      value={mobile}
                      onChangeText={setMobile}
                      maxLength={10}
                    />
                  </View>
                  {showCCPicker && (
                    <Animated.View entering={FadeInDown.duration(200)} style={styles.ccDropdown}>
                      {COUNTRY_CODES.map(cc => (
                        <Pressable
                          key={cc.code}
                          style={styles.ccOption}
                          onPress={() => { setCountryCode(cc); setShowCCPicker(false); }}
                        >
                          <Text style={styles.ccFlag}>{cc.flag}</Text>
                          <Text style={styles.ccOptionText}>{cc.name}</Text>
                          <Text style={styles.ccOptionCode}>{cc.code}</Text>
                        </Pressable>
                      ))}
                    </Animated.View>
                  )}
                </View>
              </Animated.View>

              {/* Send OTP CTA */}
              <Animated.View entering={FadeInUp.duration(400).delay(400)}>
                <Pressable
                  style={({ pressed }) => [styles.ctaBtn, { opacity: pressed ? 0.85 : 1 }]}
                  onPress={handleSendOtp}
                  disabled={sendingOtp}
                >
                  {sendingOtp ? (
                    <ActivityIndicator color={colors.surface} size="small" />
                  ) : (
                    <>
                      <Text style={styles.ctaText}>Send OTP</Text>
                      <Icon name="arrow-forward" size={20} color={colors.surface} />
                    </>
                  )}
                </Pressable>
              </Animated.View>
            </Animated.View>

            {/* OTP Sub-screen */}
            <Animated.View style={[styles.formBlock, otpStyle]}>
              <Animated.View entering={FadeInDown.duration(400)}>
                <Text style={styles.otpTitle}>Enter OTP</Text>
                <Text style={styles.otpSubtitle}>
                  Sent to {countryCode.code} {mobile}
                </Text>
              </Animated.View>

              {/* 4 OTP boxes + hidden input */}
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <OtpBox key={i} index={i} value={digit} focused={focusedOtp === i && showOtp} />
                ))}
              </View>

              {/* Hidden inputs */}
              <View style={styles.hiddenInputs}>
                {otp.map((_, i) => (
                  <TextInput
                    key={i}
                    ref={otpRefs[i]}
                    style={styles.hiddenInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={otp[i]}
                    onChangeText={text => handleOtpChange(text, i)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                    onFocus={() => setFocusedOtp(i)}
                    caretHidden
                  />
                ))}
              </View>

              {/* Timer + Resend */}
              <View style={styles.timerRow}>
                {timer > 0 ? (
                  <Text style={styles.timerText}>Resend in <Text style={{ color: colors.primary, fontWeight: '700' }}>{timer}s</Text></Text>
                ) : (
                  <Pressable onPress={resendOtp}>
                    <Text style={styles.resendBtn}>Resend OTP</Text>
                  </Pressable>
                )}
              </View>

              {/* Verify CTA */}
              <Pressable
                style={({ pressed }) => [styles.ctaBtn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => navigation.navigate('Onboarding2')}
              >
                <Text style={styles.ctaText}>Verify & Continue</Text>
                <Icon name="arrow-forward" size={20} color={colors.surface} />
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl },

  backBtn: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.xs },
  backBtnSpacer: { height: 40 + spacing.sm + spacing.xs, marginBottom: 0 },
  backCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
    ...shadows.small,
  },

  // Illustration
  illusCard: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.lavenderSoft,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  childEmoji: { fontSize: 64, marginBottom: spacing.xs },
  illusTextBox: { alignItems: 'center' },
  illusTitle: { ...textStyles.headingMedium, color: colors.primary },
  illusSub: { ...textStyles.caption, color: colors.textSecondary, marginTop: 2 },

  // Form
  formBlock: { paddingHorizontal: spacing.md },

  // Tab toggle
  tabContainer: { marginBottom: spacing.lg },
  tabTrack: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.full,
    padding: 4,
    position: 'relative',
    height: 48,
  },
  tabPill: {
    position: 'absolute',
    top: 4, bottom: 4,
    width: '50%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    ...shadows.small,
  },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  tabText: { ...textStyles.bodyMedium, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.surface },

  // Inputs
  fields: { gap: spacing.md, marginBottom: spacing.lg },
  label: { ...textStyles.bodyMedium, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '500' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 56,
    gap: spacing.sm,
    ...shadows.small,
  },
  input: {
    flex: 1,
    ...textStyles.bodyLarge,
    color: colors.textPrimary,
    height: '100%',
  },

  // Country code chip
  ccChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ccFlag: { fontSize: 18 },
  ccCode: { ...textStyles.bodyMedium, fontWeight: '600', color: colors.textPrimary },
  divider: { width: 1, height: 24, backgroundColor: colors.border, marginHorizontal: 4 },
  ccDropdown: {
    position: 'absolute',
    top: 62,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 100,
    ...shadows.medium,
    overflow: 'hidden',
  },
  ccOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ccOptionText: { ...textStyles.bodyMedium, flex: 1, color: colors.textPrimary, fontWeight: '500' },
  ccOptionCode: { ...textStyles.bodyMedium, color: colors.textSecondary },

  // CTA
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.large,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.medium,
  },
  ctaText: { ...textStyles.button, color: colors.surface, fontSize: 16 },

  // OTP
  otpTitle: { ...textStyles.headingLarge, marginBottom: spacing.xs },
  otpSubtitle: { ...textStyles.bodyMedium, color: colors.textSecondary, marginBottom: spacing.xl },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.md },
  otpBox: {
    width: 56, height: 56,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.small,
  },
  otpBoxFocused: { borderColor: colors.primary, borderWidth: 2.5 },
  otpBoxFilled: { backgroundColor: colors.lavenderSoft, borderColor: colors.primary },
  otpDigit: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  hiddenInputs: { flexDirection: 'row', position: 'absolute', opacity: 0, height: 0 },
  hiddenInput: { width: 56, height: 56 },
  timerRow: { alignItems: 'center', marginBottom: spacing.xl },
  timerText: { ...textStyles.bodyMedium, color: colors.textSecondary },
  resendBtn: { ...textStyles.bodyMedium, color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
});
