import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { useSubmitMissionMutation, useMissionsQuery } from '../../query/missions';
import { colors, shadows, textStyles } from '../../theme';
import type { Mission } from '../../types';

const MISSION_BG = '#F5F7FA';
const CARD_RADIUS = 20;
const TITLE_CARD = 22;
const TITLE_MODAL = 28;
const EXPAND_SPRING = { damping: 18, stiffness: 120 };

const C_INK = '#0D0D0D';
const C_MUTED = '#6B6678';
const C_LABEL_MUTED = '#9B95A8';
const C_PRIMARY = '#7C6AE8';
const C_SURFACE = '#FFFFFF';
const C_ACCENT = '#E8A04A';
const C_GROWTH = '#3FA97A';
const C_AMBER = '#F59E0B';

type EvidenceDraft = {
  photoUri?: string;
  voiceUri?: string;
  text?: string;
};

function StatusBadge({
  status,
  flash,
}: {
  status: Mission['submissionStatus'];
  flash: SharedValue<number>;
}) {
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  const label =
    status === 'pending' ? 'Pending' : status === 'submitted' ? 'Submitted' : 'Approved';

  const badgeStyle =
    status === 'pending'
      ? styles.badgePending
      : status === 'submitted'
        ? styles.badgeSubmitted
        : styles.badgeApproved;

  return (
    <View style={styles.badgeWrap}>
      <Animated.View style={[styles.badgeFlash, flashStyle]} pointerEvents="none" />
      <View style={[styles.badge, badgeStyle]}>
        <Text style={styles.badgeTextLight}>{label}</Text>
      </View>
    </View>
  );
}

function WaveBar({
  index,
  active,
  phase,
}: {
  index: number;
  active: boolean;
  phase: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const base = phase.value * 18 + 4;
    const wave = Math.sin(index * 1.2 + phase.value * Math.PI * 2) * 8;
    return {
      height: active ? Math.max(6, base + wave) : 4,
      opacity: active ? 1 : 0.35,
    };
  });

  return <Animated.View style={[styles.waveBar, style]} />;
}

function RecordingWaveform({ active }: { active: boolean }) {
  const phase = useSharedValue(0);

  useEffect(() => {
    if (active) {
      phase.value = withRepeat(withTiming(1, { duration: 520 }), -1, true);
    } else {
      phase.value = withTiming(0, { duration: 200 });
    }
  }, [active, phase]);

  return (
    <View style={styles.waveRow}>
      {[0, 1, 2, 3, 4].map((i) => (
        <WaveBar key={i} index={i} active={active} phase={phase} />
      ))}
    </View>
  );
}

const MissionListCard = React.memo(function MissionListCard({
  mission,
  onOpen,
}: {
  mission: Mission;
  onOpen: (m: Mission) => void;
}) {
  const flash = useSharedValue(0);
  const prev = useRef(mission.submissionStatus);

  useEffect(() => {
    if (mission.submissionStatus === 'approved' && prev.current !== 'approved') {
      flash.value = withSequence(
        withTiming(1, { duration: 160 }),
        withTiming(0, { duration: 380 }),
      );
    }
    prev.current = mission.submissionStatus;
  }, [mission.submissionStatus, flash]);

  return (
    <Pressable
      onPress={() => onOpen(mission)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={mission.title}
    >
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {mission.title}
        </Text>
        <StatusBadge status={mission.submissionStatus} flash={flash} />
      </View>
      <Text style={styles.cardDesc} numberOfLines={1}>
        {mission.description}
      </Text>
    </Pressable>
  );
});

function MissionTile({
  label,
  icon,
  disabled,
  done,
  onPress,
  previewUri,
  recording,
}: {
  label: string;
  icon: string;
  disabled: boolean;
  done: boolean;
  onPress: () => void;
  previewUri?: string;
  recording?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.tile, disabled && styles.tileDisabled, recording && styles.tileRecording]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={styles.tileThumb} />
      ) : (
        <Icon
          name={icon}
          size={28}
          color={disabled ? C_LABEL_MUTED : C_PRIMARY}
        />
      )}
      <Text style={[styles.tileLabel, disabled && styles.tileLabelDisabled]}>{label}</Text>
      {done ? (
        <View style={styles.checkBubble}>
          <Icon name="check" size={16} color={C_SURFACE} />
        </View>
      ) : null}
    </Pressable>
  );
}

type Props = {
  scrollBottomPad: number;
};

export function MissionsTabPanel({ scrollBottomPad }: Props) {
  const insets = useSafeAreaInsets();
  const { data: missions = [] } = useMissionsQuery();
  const submitMutation = useSubmitMissionMutation();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EvidenceDraft>({});
  const [textExpanded, setTextExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const detailFlash = useSharedValue(0);

  const submitScale = useSharedValue(1);
  const submitBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitScale.value }],
  }));

  const expandedMission = useMemo(
    () => missions.find((m) => m.id === expandedId) ?? null,
    [missions, expandedId],
  );

  const resetDraft = useCallback(() => {
    setDraft({});
    setTextExpanded(false);
    setIsRecording(false);
  }, []);

  const closeExpanded = useCallback(() => {
    setExpandedId(null);
    resetDraft();
  }, [resetDraft]);

  const openMission = useCallback(
    (mission: Mission) => {
      if (mission.submissionStatus === 'pending') {
        resetDraft();
      } else {
        setDraft({
          text: mission.submission?.text,
        });
        setTextExpanded(!!mission.submission?.text);
      }
      setExpandedId(mission.id);
    },
    [resetDraft],
  );

  useEffect(() => {
    return () => {
      const r = recordingRef.current;
      if (r) {
        r.stopAndUnloadAsync().catch(() => undefined);
        recordingRef.current = null;
      }
    };
  }, []);

  const pickPhoto = useCallback(async () => {
    if (!expandedMission) {
      return;
    }
    if (!expandedMission.evidenceTypes.includes('photo')) {
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      setDraft((d) => ({ ...d, photoUri: res.assets[0].uri }));
    }
  }, [expandedMission]);

  const toggleRecording = useCallback(async () => {
    if (!expandedMission?.evidenceTypes.includes('voice')) {
      return;
    }
    if (isRecording) {
      const rec = recordingRef.current;
      if (rec) {
        await rec.stopAndUnloadAsync();
        const uri = rec.getURI() ?? undefined;
        recordingRef.current = null;
        setIsRecording(false);
        if (uri) {
          setDraft((d) => ({ ...d, voiceUri: uri }));
        }
      }
      return;
    }
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recordingRef.current = recording;
    setIsRecording(true);
  }, [expandedMission, isRecording]);

  const canSubmit = useMemo(() => {
    if (!expandedMission) {
      return false;
    }
    if (
      expandedMission.submissionStatus === 'submitted' ||
      expandedMission.submissionStatus === 'approved'
    ) {
      return false;
    }
    const et = expandedMission.evidenceTypes;
    const okPhoto = et.includes('photo') && !!draft.photoUri;
    const okVoice = et.includes('voice') && !!draft.voiceUri;
    const okText = et.includes('text') && !!draft.text?.trim();
    return okPhoto || okVoice || okText;
  }, [draft.photoUri, draft.text, draft.voiceUri, expandedMission]);

  const onSubmit = useCallback(() => {
    if (!expandedMission || !canSubmit) {
      return;
    }
    submitScale.value = withSequence(
      withSpring(0.96, EXPAND_SPRING),
      withSpring(1, EXPAND_SPRING),
    );
    submitMutation.mutate({
      missionId: expandedMission.id,
      photoUri: draft.photoUri,
      voiceUri: draft.voiceUri,
      text: draft.text,
    });
  }, [canSubmit, draft.photoUri, draft.text, draft.voiceUri, expandedMission, submitMutation, submitScale]);

  const modalVisible = expandedId !== null && expandedMission !== null;

  return (
    <View style={styles.screenRoot}>
      <ScrollView
        contentContainerStyle={[styles.listScroll, { paddingBottom: scrollBottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {missions.map((m) => (
          <MissionListCard key={m.id} mission={m} onOpen={openMission} />
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeExpanded}
        statusBarTranslucent
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'left', 'right']}>
          <View style={styles.modalInner}>
            <View style={styles.modalHeaderRow}>
              <Pressable
                onPress={closeExpanded}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close mission"
              >
                <Icon name="close" size={24} color={C_INK} />
              </Pressable>
              {expandedMission ? (
                <StatusBadge status={expandedMission.submissionStatus} flash={detailFlash} />
              ) : null}
            </View>

            <ScrollView
              style={styles.detailScroll}
              contentContainerStyle={styles.detailScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {expandedMission ? (
                <>
                  <Text style={styles.modalTitle}>{expandedMission.title}</Text>
                  <Text style={styles.mentorCaps}>
                    {expandedMission.assignedBy === 'Mentor' ? 'MENTOR' : 'SCHOOL'}
                  </Text>
                  <Text style={styles.bodyText}>{expandedMission.description}</Text>
                </>
              ) : null}
            </ScrollView>

            <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={0} style={styles.kav}>
              <View style={[styles.submissionBlock, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <Text style={styles.submissionHeading}>SUBMISSION</Text>
                {expandedMission ? (
                  <>
                    <View style={styles.tileRow}>
                      <MissionTile
                        label="Photo"
                        icon="photo-camera"
                        disabled={!expandedMission.evidenceTypes.includes('photo')}
                        done={!!draft.photoUri}
                        onPress={pickPhoto}
                        previewUri={draft.photoUri}
                      />
                      <MissionTile
                        label="Voice"
                        icon="mic"
                        disabled={!expandedMission.evidenceTypes.includes('voice')}
                        done={!!draft.voiceUri}
                        onPress={toggleRecording}
                        recording={isRecording}
                      />
                      <MissionTile
                        label="Text"
                        icon="edit-note"
                        disabled={!expandedMission.evidenceTypes.includes('text')}
                        done={!!draft.text?.trim()}
                        onPress={() => setTextExpanded(true)}
                      />
                    </View>
                    {isRecording ? <RecordingWaveform active /> : null}
                    {expandedMission.evidenceTypes.includes('text') ? (
                      <TextInput
                        style={[
                          styles.textInput,
                          textExpanded ? styles.textInputExpanded : styles.textInputCollapsed,
                        ]}
                        placeholder="Add a written reflection…"
                        placeholderTextColor={C_LABEL_MUTED}
                        multiline
                        value={draft.text ?? ''}
                        onChangeText={(t) => setDraft((d) => ({ ...d, text: t }))}
                        onFocus={() => setTextExpanded(true)}
                        textAlignVertical="top"
                      />
                    ) : null}
                    <Animated.View style={submitBtnStyle}>
                      <Pressable
                        style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                        onPress={onSubmit}
                        disabled={!canSubmit || submitMutation.isPending}
                      >
                        {submitMutation.isPending ? (
                          <ActivityIndicator color={C_SURFACE} />
                        ) : (
                          <Text style={styles.submitLabel}>SUBMIT EVIDENCE</Text>
                        )}
                      </Pressable>
                    </Animated.View>
                  </>
                ) : null}
              </View>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: 'transparent',
    marginHorizontal: -16,
  },
  listScroll: {
    paddingTop: 4,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    backgroundColor: C_SURFACE,
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 18,
    paddingVertical: 16,
    // marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(13,13,13,0.06)',
    ...shadows.soft,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    ...textStyles.headingMedium,
    flex: 1,
  },
  cardDesc: {
    ...textStyles.bodyMedium,
    color: colors.textSecondary,
  },
  badgeWrap: {
    position: 'relative',
    borderRadius: 999,
    overflow: 'hidden',
  },
  badgeFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C_GROWTH,
    borderRadius: 999,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgePending: {
    backgroundColor: C_AMBER,
  },
  badgeSubmitted: {
    backgroundColor: C_ACCENT,
  },
  badgeApproved: {
    backgroundColor: C_GROWTH,
  },
  badgeTextLight: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: C_SURFACE,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: MISSION_BG,
  },
  modalInner: {
    flex: 1,
    flexDirection: 'column',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(13,13,13,0.08)',
  },
  detailScroll: {
    flex: 1,
    minHeight: 0,
  },
  detailScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 8,
  },
  modalTitle: {
    fontSize: TITLE_MODAL,
    fontWeight: '800',
    color: C_INK,
    letterSpacing: -0.4,
  },
  mentorCaps: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: C_LABEL_MUTED,
  },
  bodyText: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#111111',
  },
  kav: {
    width: '100%',
  },
  submissionBlock: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(13,13,13,0.08)',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: MISSION_BG,
  },
  submissionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: C_LABEL_MUTED,
    marginBottom: 10,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  tile: {
    flex: 1,
    minHeight: 96,
    borderRadius: 16,
    backgroundColor: C_SURFACE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(13,13,13,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tileDisabled: {
    opacity: 0.45,
  },
  tileRecording: {
    borderColor: C_PRIMARY,
    borderWidth: 2,
  },
  tileLabel: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '800',
    color: C_INK,
  },
  tileLabelDisabled: {
    color: C_LABEL_MUTED,
  },
  tileThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  checkBubble: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    height: 32,
    marginBottom: 8,
  },
  waveBar: {
    width: 5,
    borderRadius: 3,
    backgroundColor: C_PRIMARY,
  },
  textInput: {
    width: '100%',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(13,13,13,0.12)',
    backgroundColor: C_SURFACE,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111111',
    marginBottom: 12,
  },
  textInputCollapsed: {
    minHeight: 88,
    maxHeight: 120,
  },
  textInputExpanded: {
    minHeight: 140,
    maxHeight: 220,
  },
  submitBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: C_INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#C4BFCF',
  },
  submitLabel: {
    color: C_SURFACE,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
