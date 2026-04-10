import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  FadeInDown,
  FadeInUp,
  Easing,
  interpolateColor,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';

const { width: SW } = Dimensions.get('window');

// ─── Step Progress (same as other screens) ───────────────────────────────────
const StepProgress = ({ current, total = 4 }: { current: number; total?: number }) => (
  <View style={spStyles.wrapper}>
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <View style={[spStyles.dot, i + 1 <= current && spStyles.dotActive]}>
          {i + 1 < current
            ? <Icon name="check" size={12} color={colors.surface} />
            : <Text style={[spStyles.dotNum, i + 1 === current && spStyles.dotNumActive]}>{i + 1}</Text>}
        </View>
        {i < total - 1 && <View style={[spStyles.line, i + 1 < current && spStyles.lineActive]} />}
      </React.Fragment>
    ))}
  </View>
);
const spStyles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotNum: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  dotNumActive: { color: colors.surface },
  line: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 4 },
  lineActive: { backgroundColor: colors.primary },
});

// ─── Confetti Particle ────────────────────────────────────────────────────────
const CONFETTI_COLORS = [colors.primary, colors.lavender, colors.peach, colors.mint, colors.growth, '#FFD700'];

const ConfettiParticle = ({
  x, delay, color,
}: { x: number; delay: number; color: string }) => {
  const ty = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rot = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    ty.value = withDelay(delay, withTiming(400, { duration: 1400, easing: Easing.in(Easing.cubic) }));
    rot.value = withDelay(delay, withTiming(360 * 3, { duration: 1400 }));
    const cleanup = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 });
    }, delay + 1000);
    return () => clearTimeout(cleanup);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }, { rotate: `${rot.value}deg` }],
    opacity: opacity.value,
    position: 'absolute',
    top: -20,
    left: x,
  }));

  return (
    <Animated.View style={[style, { width: 8, height: 8, borderRadius: 2, backgroundColor: color }]} />
  );
};

// ─── PIN Dot ─────────────────────────────────────────────────────────────────
const PinDot = ({ filled, state }: { filled: boolean; state: 'idle' | 'match' | 'error' }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (filled) {
      scale.value = withSequence(withSpring(1.25, { damping: 12 }), withSpring(1, { damping: 15 }));
    }
  }, [filled]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bg = filled
    ? state === 'match' ? colors.growth : colors.primary
    : 'transparent';

  const border = filled
    ? state === 'match' ? colors.growth : colors.primary
    : colors.border;

  return (
    <Animated.View
      style={[style, {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: bg,
        borderWidth: 2.5,
        borderColor: border,
      }]}
    />
  );
};

// ─── Numpad key ───────────────────────────────────────────────────────────────
const NumKey = ({ label, onPress, icon }: { label?: string; icon?: string; onPress: () => void }) => {
  const scale = useSharedValue(1);
  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
      <Pressable
        style={({ pressed }) => [styles.numKey, pressed && { opacity: 0.7 }]}
        onPress={() => {
          scale.value = withSequence(withSpring(0.9, { damping: 12 }), withSpring(1, { damping: 15 }));
          onPress();
        }}
      >
        {icon
          ? <Icon name={icon} size={24} color={colors.textPrimary} />
          : <Text style={styles.numKeyText}>{label}</Text>}
      </Pressable>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
interface Props { navigation: any; }

export function OnboardingScreen4({ navigation }: Props) {
  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [pin, setPin] = useState<string[]>([]);
  const [confirmPin, setConfirmPin] = useState<string[]>([]);
  const [pinState, setPinState] = useState<'idle' | 'match' | 'error'>('idle');
  const [showConfetti, setShowConfetti] = useState(false);
  const hiddenInputRef = useRef<TextInput>(null);

  // Auto-focus hidden input so system keyboard opens
  useEffect(() => {
    const timer = setTimeout(() => hiddenInputRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  // Re-focus hidden input when step changes (set -> confirm)
  useEffect(() => {
    setTimeout(() => hiddenInputRef.current?.focus(), 350);
  }, [step]);

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  const confettiParticles = Array.from({ length: 24 }, (_, i) => ({
    x: Math.random() * SW,
    delay: i * 50,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));

  const currentPin = step === 'set' ? pin : confirmPin;
  const setCurrentPin = step === 'set' ? setPin : setConfirmPin;

  const handleKey = (digit: string) => {
    if (currentPin.length >= 4) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = [...currentPin, digit];
    setCurrentPin(next);

    if (next.length === 4) {
      if (step === 'set') {
        setTimeout(() => {
          setStep('confirm');
          setConfirmPin([]);
          setPinState('idle');
        }, 300);
      } else {
        // Validate
        const pinStr = [...pin].join('');
        const confirmStr = next.join('');
        if (pinStr === confirmStr) {
          setPinState('match');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setShowConfetti(true);
          setTimeout(() => {
            navigation.navigate('Main');
          }, 1200);
        } else {
          setPinState('error');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          shakeX.value = withSequence(
            withTiming(-10, { duration: 60 }),
            withTiming(10, { duration: 60 }),
            withTiming(-10, { duration: 60 }),
            withTiming(10, { duration: 60 }),
            withTiming(0, { duration: 60 }),
          );
          setTimeout(() => {
            setConfirmPin([]);
            setPinState('idle');
          }, 700);
        }
      }
    }
  };

  const handleDelete = () => {
    if (currentPin.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentPin(currentPin.slice(0, -1));
    if (pinState !== 'idle') setPinState('idle');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      {/* Hidden input — auto-focuses to open system numpad keyboard */}
      <TextInput
        ref={hiddenInputRef}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={1}
        caretHidden
        value=""
        onChangeText={(text) => {
          const digit = text.replace(/[^0-9]/g, '').slice(-1);
          if (digit) handleKey(digit);
        }}
      />

      {/* Confetti layer */}
      {showConfetti && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {confettiParticles.map((p, i) => (
            <ConfettiParticle key={i} x={p.x} delay={p.delay} color={p.color} />
          ))}
        </View>
      )}

      {/* Back button */}
      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <View style={styles.backCircle}>
          <Icon name="arrow-back" size={20} color={colors.textPrimary} />
        </View>
      </Pressable>

      {/* Step progress */}
      <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: spacing.md }}>
        <StepProgress current={4} />
      </Animated.View>

      {/* Lock illustration */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.illusWrap}>
        <View style={styles.lockOuter}>
          <View style={styles.lockInner}>
            <Icon name="lock" size={40} color={colors.primary} />
          </View>
        </View>
        {/* Decorative orbs */}
        <View style={styles.orb1} />
        <View style={styles.orb2} />
        <View style={styles.orb3} />
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.titleWrap}>
        <Text style={styles.title}>Set your quick login PIN</Text>
        <Text style={styles.sub}>
          {step === 'set' ? 'Use this instead of password every time' : 'Confirm your 4-digit PIN'}
        </Text>
      </Animated.View>

      {/* PIN dots */}
      <Animated.View style={[styles.dotsWrap, shakeStyle]} entering={FadeInDown.duration(400).delay(280)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <PinDot key={i} filled={i < currentPin.length} state={pinState} />
        ))}
      </Animated.View>

      {/* State hint */}
      <Animated.View entering={FadeInDown.delay(320)}>
        {pinState === 'error' && (
          <Text style={styles.errorHint}>PINs don't match. Try again.</Text>
        )}
        {pinState === 'match' && (
          <Text style={styles.successHint}>✓ PINs match!</Text>
        )}
      </Animated.View>

      {/* Numpad */}
      <Animated.View entering={FadeInUp.duration(500).delay(300)} style={styles.numpad}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, ri) => (
          <View key={ri} style={styles.numRow}>
            {row.map(d => <NumKey key={d} label={d} onPress={() => handleKey(d)} />)}
          </View>
        ))}
        <View style={styles.numRow}>
          <View style={{ flex: 1 }} />
          <NumKey label="0" onPress={() => handleKey('0')} />
          <NumKey icon="backspace" onPress={handleDelete} />
        </View>
      </Animated.View>

      {/* Finish CTA */}
      {pinState === 'match' && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.ctaWrap}>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.ctaText}>Finish Setup</Text>
            <Icon name="celebration" size={20} color={colors.surface} />
          </Pressable>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  hiddenInput: {
    position: 'absolute', width: 0, height: 0, opacity: 0,
  },

  backBtn: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.xs },
  backCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border, ...shadows.small,
  },

  // Lock illustration
  illusWrap: {
    alignItems: 'center', justifyContent: 'center',
    height: 140, marginVertical: spacing.lg, position: 'relative',
  },
  lockOuter: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.lavenderSoft,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.medium,
  },
  lockInner: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.primaryLight,
  },
  orb1: {
    position: 'absolute', right: SW * 0.18, top: 10,
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.peachSoft,
  },
  orb2: {
    position: 'absolute', left: SW * 0.18, bottom: 20,
    width: 20, height: 20, borderRadius: 10, backgroundColor: colors.mintSoft,
  },
  orb3: {
    position: 'absolute', right: SW * 0.28, bottom: 5,
    width: 14, height: 14, borderRadius: 7, backgroundColor: colors.skySoft,
  },

  titleWrap: { alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  title: { ...textStyles.headingLarge, textAlign: 'center', marginBottom: spacing.xs },
  sub: { ...textStyles.bodyMedium, color: colors.textSecondary, textAlign: 'center' },

  dotsWrap: {
    flexDirection: 'row', justifyContent: 'center',
    gap: spacing.lg, marginBottom: spacing.sm,
  },

  errorHint: {
    textAlign: 'center', color: colors.error,
    ...textStyles.bodyMedium, marginBottom: spacing.sm,
  },
  successHint: {
    textAlign: 'center', color: colors.growth,
    ...textStyles.bodyMedium, fontWeight: '700', marginBottom: spacing.sm,
  },

  // Numpad
  numpad: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  numRow: { flexDirection: 'row', gap: spacing.sm },
  numKey: {
    flex: 1, height: 60,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
    ...shadows.small,
  },
  numKeyText: { fontSize: 22, fontWeight: '600', color: colors.textPrimary },

  // CTA
  ctaWrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  ctaBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.large,
    height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, ...shadows.medium,
  },
  ctaText: { ...textStyles.button, color: colors.surface, fontSize: 16 },
});
