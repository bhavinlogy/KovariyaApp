import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors, spacing, borderRadius, shadows, textStyles } from '../theme';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoginCredentials } from '../types/auth';

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function LoginScreen() {
  const { login, isSigningIn } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  const handleLogin = async () => {
    const next = { email: '', password: '' };

    if (!email.trim()) {
      next.email = 'Email is required';
    } else if (!validateEmail(email)) {
      next.email = 'Enter a valid email';
    }

    if (!password) {
      next.password = 'Password is required';
    } else if (password.length < 6) {
      next.password = 'Use at least 6 characters';
    }

    setFieldErrors(next);

    if (next.email || next.password) {
      showToast({
        message: next.email || next.password,
        type: 'error',
        durationMs: 4200,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const credentials: LoginCredentials = {
        email: email.trim().toLowerCase(),
        password,
      };
      await login(credentials);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Could not sign you in. Please try again';
      showToast({ message: msg, type: 'error', durationMs: 5200 });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((v) => !v);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroBlob} />
          <View style={styles.header}>
            <View style={styles.mark}>
              <View style={styles.markInner}>
                <Icon name="spa" size={28} color={colors.ink} />
              </View>
              <Text style={styles.brand}>Kovariya</Text>
              <Text style={styles.tagline}>Smart parenting, calmer days</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>
              Sign in with your email and password. Your session stays on this device.
            </Text>

            <View style={styles.fields}>
              <InputField
                label="Email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (fieldErrors.email) {
                    setFieldErrors((e) => ({ ...e, email: '' }));
                  }
                }}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                error={fieldErrors.email}
                leftIcon={<Icon name="alternate-email" size={22} color={colors.textMuted} />}
              />

              <InputField
                label="Password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (fieldErrors.password) {
                    setFieldErrors((e) => ({ ...e, password: '' }));
                  }
                }}
                placeholder="Your password"
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
                error={fieldErrors.password}
                leftIcon={<Icon name="lock-outline" size={22} color={colors.textMuted} />}
                rightIcon={
                  <Icon
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={22}
                    color={colors.textMuted}
                  />
                }
                onRightIconPress={togglePasswordVisibility}
              />
            </View>

            <Button
              title="Sign in"
              onPress={handleLogin}
              loading={isSigningIn}
              disabled={isSigningIn}
              size="large"
              style={styles.cta}
            />

            {__DEV__ ? (
              <View style={styles.devHint}>
                <Icon name="science" size={18} color={colors.textSecondary} />
                <Text style={styles.devHintText}>
                  Dev: user@kovariya.com / password
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            style={styles.helpRow}
            onPress={() =>
              showToast({
                message: 'Contact support from Profile once it is connected.',
                type: 'info',
              })
            }
          >
            <Text style={styles.helpText}>Need help signing in?</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroBlob: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.lavenderSoft,
    opacity: 0.95,
  },
  header: {
    paddingTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  mark: {
    alignItems: 'flex-start',
  },
  markInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.soft,
  },
  brand: {
    ...textStyles.hero,
    fontSize: 32,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    maxWidth: 280,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.soft,
  },
  title: {
    ...textStyles.headingLarge,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  fields: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  cta: {
    marginTop: spacing.sm,
  },
  devHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.large,
  },
  devHintText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  helpRow: {
    marginTop: spacing.xl,
    alignItems: 'center',
    padding: spacing.sm,
  },
  helpText: {
    ...textStyles.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
});
