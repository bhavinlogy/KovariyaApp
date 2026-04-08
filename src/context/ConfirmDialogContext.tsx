import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button } from '../components/Button';
import { borderRadius, colors, shadows, spacing, textStyles } from '../theme';

type ConfirmDialogOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'default' | 'danger';
  icon?: string;
  onConfirm?: () => void | Promise<void>;
};

type ConfirmDialogContextValue = {
  showConfirm: (options: ConfirmDialogOptions) => void;
  hideConfirm: () => void;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | undefined>(undefined);

type DialogState = ConfirmDialogOptions & {
  visible: boolean;
};

const INITIAL_STATE: DialogState = {
  visible: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  tone: 'default',
  icon: 'help-outline',
};

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hideConfirm = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    setDialog(INITIAL_STATE);
  }, [isSubmitting]);

  const showConfirm = useCallback((options: ConfirmDialogOptions) => {
    setDialog({
      visible: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? 'Confirm',
      cancelText: options.cancelText ?? 'Cancel',
      tone: options.tone ?? 'default',
      icon: options.icon ?? (options.tone === 'danger' ? 'logout' : 'help-outline'),
      onConfirm: options.onConfirm,
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!dialog.onConfirm) {
      setDialog(INITIAL_STATE);
      return;
    }

    try {
      setIsSubmitting(true);
      await dialog.onConfirm();
      setDialog(INITIAL_STATE);
    } finally {
      setIsSubmitting(false);
    }
  }, [dialog]);

  const value = useMemo(
    () => ({
      showConfirm,
      hideConfirm,
    }),
    [hideConfirm, showConfirm]
  );

  const isDanger = dialog.tone === 'danger';

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}

      <Modal
        visible={dialog.visible}
        transparent
        animationType="fade"
        onRequestClose={hideConfirm}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={hideConfirm} />

          <View style={styles.sheetWrap} pointerEvents="box-none">
            <View style={styles.dialogCard}>
              <View
                style={[
                  styles.iconOrb,
                  isDanger ? styles.iconOrbDanger : styles.iconOrbDefault,
                ]}
              >
                <Icon
                  name={dialog.icon ?? 'help-outline'}
                  size={24}
                  color={isDanger ? colors.error : colors.primary}
                />
              </View>

              <Text style={styles.title}>{dialog.title}</Text>
              <Text style={styles.message}>{dialog.message}</Text>

              <View style={styles.actionRow}>
                <View style={styles.actionSlot}>
                  <Button
                    title={dialog.cancelText ?? 'Cancel'}
                    onPress={hideConfirm}
                    variant="ghost"
                    size="medium"
                    disabled={isSubmitting}
                    style={styles.secondaryAction}
                    textStyle={styles.secondaryActionText}
                  />
                </View>
                <View style={styles.actionSlot}>
                  <Button
                    title={dialog.confirmText ?? 'Confirm'}
                    onPress={handleConfirm}
                    variant={isDanger ? 'primary' : 'outline'}
                    size="medium"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={isDanger ? styles.primaryActionDanger : styles.primaryAction}
                    textStyle={isDanger ? styles.primaryActionDangerText : undefined}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.inkOverlay,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  sheetWrap: {
    justifyContent: 'center',
  },
  dialogCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.large,
  },
  iconOrb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconOrbDefault: {
    backgroundColor: colors.lavenderSoft,
  },
  iconOrbDanger: {
    backgroundColor: 'rgba(232, 93, 93, 0.12)',
  },
  title: {
    ...textStyles.headingLarge,
    textAlign: 'center',
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  message: {
    ...textStyles.bodyMedium,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionSlot: {
    flex: 1,
    minWidth: 0,
  },
  secondaryAction: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.large,
    width: '100%',
  },
  secondaryActionText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  primaryAction: {
    borderRadius: borderRadius.large,
    width: '100%',
  },
  primaryActionDanger: {
    borderRadius: borderRadius.large,
    width: '100%',
    backgroundColor: colors.error,
  },
  primaryActionDangerText: {
    color: colors.surface,
  },
});
