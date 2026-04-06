import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button } from './Button';
import { DatePickerField } from './DatePickerField';
import { FloatingLabelField } from './FloatingLabelField';
import { SelectField, type SelectOption } from './SelectField';
import { PRESET_SCHOOLS } from '../data/schools';
import { useToast } from '../context/ToastContext';
import type { Child } from '../types';
import { ageFromIsoDate, toIsoDate } from '../utils/age';
import { borderRadius, colors, spacing, textStyles } from '../theme';
import { GRADIENT_60_END } from '../theme/layout';

const GENDER_OPTIONS: SelectOption[] = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const GRADE_OPTIONS: SelectOption[] = [
  { value: '', label: 'Select class' },
  ...Array.from({ length: 10 }, (_, i) => ({
    value: `class${i + 1}`,
    label: `Class ${i + 1}`,
  })),
];

const SECTION_OPTIONS: SelectOption[] = [
  { value: '', label: 'Select section' },
  { value: 'A', label: 'Section A' },
  { value: 'B', label: 'Section B' },
  { value: 'C', label: 'Section C' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const CUSTOM_SCHOOL = '__custom__';

function buildSchoolOptions(): SelectOption[] {
  const presets = PRESET_SCHOOLS.map((name) => ({ value: name, label: name }));
  return [{ value: '', label: 'Select school' }, ...presets, { value: CUSTOM_SCHOOL, label: 'Other school…' }];
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (child: Child) => void;
};

export const AddChildModal = React.memo(function AddChildModal({
  visible,
  onClose,
  onSubmit,
}: Props) {
  const { showToast } = useToast();
  const schoolOptions = useMemo(() => buildSchoolOptions(), []);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dobIso, setDobIso] = useState<string | undefined>(undefined);
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [grade, setGrade] = useState<string | undefined>(undefined);
  const [section, setSection] = useState<string | undefined>(undefined);
  const [schoolChoice, setSchoolChoice] = useState<string | undefined>(undefined);
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [status, setStatus] = useState<string>('active');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setFirstName('');
    setLastName('');
    setDobIso(undefined);
    setGender(undefined);
    setGrade(undefined);
    setSection(undefined);
    setSchoolChoice(undefined);
    setCustomSchoolName('');
    setAdmissionNumber('');
    setStatus('active');
    setFormError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    onClose();
    resetForm();
  }, [isSubmitting, onClose, resetForm]);

  const resolvedSchoolName = useMemo(() => {
    if (!schoolChoice || schoolChoice.length === 0) {
      return '';
    }
    if (schoolChoice === CUSTOM_SCHOOL) {
      return customSchoolName.trim();
    }
    return schoolChoice;
  }, [schoolChoice, customSchoolName]);

  const showCustomSchool = schoolChoice === CUSTOM_SCHOOL;

  const insets = useSafeAreaInsets();

  const handleSubmit = useCallback(() => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn) {
      setFormError('Please enter the child’s first name.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!ln) {
      setFormError('Please enter the child’s last name.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!dobIso || dobIso.length < 10) {
      setFormError('Please select date of birth.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const birth = Date.parse(`${dobIso}T12:00:00`);
    const today = Date.parse(toIsoDate(new Date()) + 'T23:59:59');
    if (Number.isNaN(birth) || birth > today) {
      setFormError('Date of birth cannot be in the future.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!gender) {
      setFormError('Please select gender.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!grade) {
      setFormError('Please select class (grade).');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!section) {
      setFormError('Please select section.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!schoolChoice) {
      setFormError('Please select a school.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (schoolChoice === CUSTOM_SCHOOL && !customSchoolName.trim()) {
      setFormError('Please enter the school name.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const adm = admissionNumber.trim();
    if (!adm) {
      setFormError('Please enter the admission number.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const displayName = `${fn} ${ln}`.trim();

    setTimeout(() => {
      const child: Child = {
        id: `child-${Date.now()}`,
        name: displayName,
        firstName: fn,
        lastName: ln,
        age: ageFromIsoDate(dobIso),
        dateOfBirth: dobIso,
        gender: gender === 'male' || gender === 'female' ? gender : undefined,
        grade,
        section,
        schoolName: resolvedSchoolName,
        admissionNumber: adm,
        status,
      };
      onSubmit(child);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({
        type: 'success',
        message: `${fn} was added to your family.`,
      });
      setIsSubmitting(false);
      resetForm();
      onClose();
    }, 650);
  }, [
    firstName,
    lastName,
    dobIso,
    gender,
    grade,
    section,
    schoolChoice,
    customSchoolName,
    admissionNumber,
    status,
    resolvedSchoolName,
    onSubmit,
    onClose,
    resetForm,
    showToast,
  ]);

  const maxBirth = new Date();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.modalSafe} edges={['left', 'right']}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={GRADIENT_60_END}
            style={[styles.gradient, { paddingTop: insets.top }]}
          >
            <View style={styles.modalHeaderOrbs} pointerEvents="none">
              <View style={styles.modalHeaderOrbLarge} />
              <View style={styles.modalHeaderOrbMid} />
              <View style={styles.modalHeaderOrbTiny} />
            </View>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconOrb}>
                  <Icon name="child-care" size={20} color={colors.surface} />
                </View>
                <View style={styles.modalTitleBlock}>
                  <Text style={styles.modalTitle}>Add child</Text>
                  <Text style={styles.modalSubtitle}>School & profile details</Text>
                </View>
              </View>
              <Pressable
                onPress={handleClose}
                style={({ pressed }) => [styles.modalClose, pressed && styles.modalClosePressed]}
                accessibilityRole="button"
                accessibilityLabel="Close"
                disabled={isSubmitting}
                hitSlop={8}
              >
                <Icon name="close" size={26} color="rgba(255,255,255,0.92)" />
              </Pressable>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formSection}>
              <View style={styles.formSectionHeader}>
                <View style={[styles.formSectionIconOrb, { backgroundColor: colors.lavenderSoft }]}>
                  <Icon name="badge" size={16} color={colors.primary} />
                </View>
                <Text style={styles.formSectionTitle}>Child name</Text>
              </View>
              <View style={styles.formSectionBody}>
                <View style={styles.twoColRow}>
                  <View style={styles.twoCol}>
                    <FloatingLabelField
                      label="First name"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      leftIcon={<Icon name="person" size={18} color={colors.textMuted} />}
                    />
                  </View>
                  <View style={styles.twoCol}>
                    <FloatingLabelField
                      label="Last name"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                      leftIcon={<Icon name="person-outline" size={18} color={colors.textMuted} />}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.formSectionHeader}>
                <View style={[styles.formSectionIconOrb, { backgroundColor: colors.skySoft }]}>
                  <Icon name="cake" size={16} color={colors.info} />
                </View>
                <Text style={styles.formSectionTitle}>Date of birth</Text>
              </View>
              <View style={styles.formSectionBody}>
                <DatePickerField
                  label="Date of birth"
                  valueIso={dobIso}
                  onChangeIso={setDobIso}
                  placeholder="Tap to choose"
                  maximumDate={maxBirth}
                  leftIcon={<Icon name="event" size={18} color={colors.textMuted} />}
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.formSectionHeader}>
                <View style={[styles.formSectionIconOrb, { backgroundColor: colors.mintSoft }]}>
                  <Icon name="wc" size={16} color={colors.growth} />
                </View>
                <Text style={styles.formSectionTitle}>Gender</Text>
              </View>
              <View style={styles.formSectionBody}>
                <SelectField
                  label="Gender"
                  value={gender}
                  options={GENDER_OPTIONS}
                  onChange={setGender}
                  placeholder="Select"
                  leftIcon={<Icon name="people" size={18} color={colors.textMuted} />}
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.formSectionHeader}>
                <View style={[styles.formSectionIconOrb, { backgroundColor: colors.peachSoft }]}>
                  <Icon name="class" size={16} color={colors.accent} />
                </View>
                <Text style={styles.formSectionTitle}>Class & section</Text>
              </View>
              <View style={styles.formSectionBody}>
                <SelectField
                  label="Grade (class)"
                  value={grade}
                  options={GRADE_OPTIONS}
                  onChange={setGrade}
                  placeholder="Select class"
                  leftIcon={<Icon name="menu-book" size={18} color={colors.textMuted} />}
                />
                <SelectField
                  label="Section"
                  value={section}
                  options={SECTION_OPTIONS}
                  onChange={setSection}
                  placeholder="Select section"
                  leftIcon={<Icon name="grid-view" size={18} color={colors.textMuted} />}
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.formSectionHeader}>
                <View style={[styles.formSectionIconOrb, { backgroundColor: colors.skySoft }]}>
                  <Icon name="school" size={16} color={colors.info} />
                </View>
                <Text style={styles.formSectionTitle}>School</Text>
              </View>
              <View style={styles.formSectionBody}>
                <SelectField
                  label="School name"
                  value={schoolChoice}
                  options={schoolOptions}
                  onChange={setSchoolChoice}
                  placeholder="Select school"
                  leftIcon={<Icon name="apartment" size={18} color={colors.textMuted} />}
                />
                {showCustomSchool ? (
                  <FloatingLabelField
                    label="Enter school name"
                    value={customSchoolName}
                    onChangeText={setCustomSchoolName}
                    autoCapitalize="words"
                    leftIcon={<Icon name="add-business" size={18} color={colors.textMuted} />}
                  />
                ) : null}
                <FloatingLabelField
                  label="Admission number"
                  value={admissionNumber}
                  onChangeText={setAdmissionNumber}
                  autoCapitalize="characters"
                  leftIcon={<Icon name="confirmation-number" size={18} color={colors.textMuted} />}
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.formSectionHeader}>
                <View style={[styles.formSectionIconOrb, { backgroundColor: colors.lavenderSoft }]}>
                  <Icon name="toggle-on" size={16} color={colors.primary} />
                </View>
                <Text style={styles.formSectionTitle}>Status</Text>
              </View>
              <View style={styles.formSectionBody}>
                <SelectField
                  label="Enrollment status"
                  value={status}
                  options={STATUS_OPTIONS}
                  onChange={setStatus}
                  placeholder="Select"
                  leftIcon={<Icon name="rule" size={18} color={colors.textMuted} />}
                />
              </View>
            </View>

            {formError ? (
              <View style={styles.formErrorWrap}>
                <Icon name="error-outline" size={16} color={colors.error} />
                <Text style={styles.formError}>{formError}</Text>
              </View>
            ) : null}

            <Button
              title="Add child"
              variant="primary"
              size="large"
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={styles.submitBtn}
              icon={!isSubmitting ? <Icon name="check" size={20} color={colors.surface} /> : undefined}
            />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalSafe: {
    flex: 1,
  },
  modalHeaderGradient: {
    width: '100%',
    marginBottom: spacing.xs,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  modalHeaderOrbs: {
    ...StyleSheet.absoluteFillObject,
  },
  modalHeaderOrbLarge: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    top: -100,
    right: -72,
  },
  modalHeaderOrbMid: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(232, 228, 255, 0.16)',
    bottom: 10,
    left: 12,
  },
  modalHeaderOrbTiny: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    top: 18,
    left: '38%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    zIndex: 1,
    gap: spacing.sm,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  modalTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  modalIconOrb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...textStyles.headingMedium,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.surface,
  },
  modalSubtitle: {
    ...textStyles.caption,
    color: 'rgba(255, 255, 255, 0.76)',
    fontWeight: '600',
    marginTop: 2,
  },
  modalClose: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  modalClosePressed: {
    opacity: 0.88,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  twoCol: {
    flex: 1,
    minWidth: 0,
  },
  formSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginTop: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  formSectionIconOrb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSectionTitle: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formSectionBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  formErrorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: 'rgba(232, 93, 93, 0.08)',
    borderRadius: borderRadius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 93, 93, 0.2)',
  },
  formError: {
    ...textStyles.caption,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});
