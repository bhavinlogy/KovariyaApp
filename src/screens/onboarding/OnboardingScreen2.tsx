import React,{useState} from 'react';
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Animated,{
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	FadeInDown,
	FadeInUp,
	Easing,
	interpolate,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import {colors,spacing,borderRadius,shadows,textStyles} from '../../theme';
import {InputField} from '../../components/InputField';

const {width: SW}=Dimensions.get('window');

// ─── Step Progress Indicator ─────────────────────────────────────────────────
const StepProgress=({current,total=4}: {current: number; total?: number}) =>(
	<View style={spStyles.wrapper}>
		{Array.from({length: total}).map((_,i) =>(
			<React.Fragment key={i}>
				<View style={[spStyles.dot,i+1<=current&&spStyles.dotActive]}>
					{i+1<current?(
						<Icon name="check" size={12} color={colors.surface} />
					):(
						<Text style={[spStyles.dotNum,i+1===current&&spStyles.dotNumActive]}>{i+1}</Text>
					)}
				</View>
				{i<total-1&&(
					<View style={[spStyles.line,i+1<current&&spStyles.lineActive]} />
				)}
			</React.Fragment>
		))}
	</View>
);
const spStyles=StyleSheet.create({
	wrapper: {flexDirection: 'row',alignItems: 'center',justifyContent: 'center',marginBottom: spacing.xl},
	dot: {
		width: 28,height: 28,borderRadius: 14,
		backgroundColor: colors.surfaceMuted,
		alignItems: 'center',justifyContent: 'center',
		borderWidth: 1.5,borderColor: colors.border,
	},
	dotActive: {backgroundColor: colors.primary,borderColor: colors.primary},
	dotNum: {fontSize: 12,fontWeight: '600',color: colors.textMuted},
	dotNumActive: {color: colors.surface},
	line: {flex: 1,height: 2,backgroundColor: colors.border,marginHorizontal: 4},
	lineActive: {backgroundColor: colors.primary},
});

// ─── Role chips ───────────────────────────────────────────────────────────────
const ROLES=['Mom','Dad','Guardian'];
const LANGUAGES=[
	{code: 'en',flag: '🇬🇧',name: 'English'},
	{code: 'hi',flag: '🇮🇳',name: 'Hindi'},
	{code: 'gu',flag: '🇮🇳',name: 'Gujarati'},
	{code: 'mr',flag: '🇮🇳',name: 'Marathi'},
	{code: 'ta',flag: '🇮🇳',name: 'Tamil'},
];

// ─── Main Screen ─────────────────────────────────────────────────────────────
interface Props {navigation: any;}

export function OnboardingScreen2({navigation}: Props) {
	const [fullName,setFullName]=useState('');
	const [selectedRole,setSelectedRole]=useState<string|null>(null);
	const [email,setEmail]=useState('');
	const [selectedLang,setSelectedLang]=useState(LANGUAGES[0]);
	const [showLangDrop,setShowLangDrop]=useState(false);

	const screenX=useSharedValue(0);
	const screenStyle=useAnimatedStyle(() =>({
		transform: [{translateX: screenX.value}],
		opacity: interpolate(Math.abs(screenX.value),[0,SW],[1,0]),
	}));

	const goNext=() =>{
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		screenX.value=withTiming(-SW*0.15,{duration: 250,easing: Easing.out(Easing.cubic)},() =>{
			screenX.value=0;
		});
		navigation.navigate('Onboarding3');
	};

	const goBack=() =>{
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		navigation.goBack();
	};

	return (
		<SafeAreaView style={styles.safe} edges={['top','left','right']}>
			<KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS==='ios'? 'padding':'height'}>
				<Animated.View style={[{flex: 1},screenStyle]}>
					<ScrollView
						contentContainerStyle={styles.scroll}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						{/* Back */}
						<Pressable style={styles.backBtn} onPress={goBack}>
							<View style={styles.backCircle}>
								<Icon name="arrow-back" size={20} color={colors.textPrimary} />
							</View>
						</Pressable>

						{/* Step progress */}
						<Animated.View entering={FadeInDown.duration(400)}>
							<StepProgress current={2} />
						</Animated.View>

						{/* Header */}
						<Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.header}>
							<Text style={styles.screenTitle}>Complete Your Profile</Text>
							<Text style={styles.screenSub}>Tell us a little about yourself</Text>
						</Animated.View>

						{/* Form card */}
						<Animated.View entering={FadeInDown.duration(450).delay(180)} style={styles.formCard}>
							{/* Full name */}
							<InputField
								label="Full Name"
								value={fullName}
								onChangeText={setFullName}
								placeholder="e.g. Priya Sharma"
								leftIcon={<Icon name="person-outline" size={20} color={colors.textMuted} />}
							/>

							{/* Role chips */}
							<View style={styles.roleSection}>
								<Text style={styles.label}>I am a</Text>
								<View style={styles.roleRow}>
									{ROLES.map(role =>(
										<Pressable
											key={role}
											style={[styles.roleChip,selectedRole===role&&styles.roleChipActive]}
											onPress={() =>{
												setSelectedRole(role);
												Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
											}}
										>
											<Text style={[styles.roleChipText,selectedRole===role&&styles.roleChipTextActive]}>
												{role}
											</Text>
										</Pressable>
									))}
								</View>
							</View>

							{/* Email (optional) */}
							<InputField
								label={
									<Text>
										Email{' '}
										<Text style={{color: colors.textMuted,fontWeight: '400'}}>(optional)</Text>
									</Text>
								}
								value={email}
								onChangeText={setEmail}
								placeholder="you@example.com"
								keyboardType="email-address"
								autoCapitalize="none"
								leftIcon={<Icon name="alternate-email" size={20} color={colors.textMuted} />}
							/>

							{/* Language dropdown */}
							<View>
								<Text style={styles.label}>Language</Text>
								<Pressable
									style={styles.inputWrap}
									onPress={() =>setShowLangDrop(!showLangDrop)}
								>
									<Text style={{fontSize: 18}}>{selectedLang.flag}</Text>
									<Text style={styles.langText}>{selectedLang.name}</Text>
									<Icon
										name={showLangDrop? 'keyboard-arrow-up':'keyboard-arrow-down'}
										size={22}
										color={colors.textSecondary}
									/>
								</Pressable>
								{showLangDrop&&(
									<Animated.View entering={FadeInDown.duration(200)} style={styles.dropdown}>
										{LANGUAGES.map(lang =>(
											<Pressable
												key={lang.code}
												style={[styles.dropdownItem,selectedLang.code===lang.code&&styles.dropdownItemActive]}
												onPress={() =>{setSelectedLang(lang); setShowLangDrop(false);}}
											>
												<Text style={{fontSize: 18}}>{lang.flag}</Text>
												<Text style={[styles.dropdownText,selectedLang.code===lang.code&&{color: colors.primary,fontWeight: '600'}]}>
													{lang.name}
												</Text>
												{selectedLang.code===lang.code&&(
													<Icon name="check" size={16} color={colors.primary} />
												)}
											</Pressable>
										))}
									</Animated.View>
								)}
							</View>
						</Animated.View>

						{/* CTA */}
						<Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.ctaWrap}>
							<Pressable
								style={({pressed}) =>[styles.ctaBtn,{opacity: pressed? 0.85:1}]}
								onPress={goNext}
							>
								<Text style={styles.ctaText}>Continue</Text>
								<Icon name="arrow-forward" size={20} color={colors.surface} />
							</Pressable>
						</Animated.View>
					</ScrollView>
				</Animated.View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles=StyleSheet.create({
	safe: {flex: 1,backgroundColor: colors.background},
	scroll: {flexGrow: 1,paddingHorizontal: spacing.md,paddingBottom: spacing.xxl},

	backBtn: {paddingTop: spacing.sm,marginBottom: spacing.md},
	backCircle: {
		width: 40,height: 40,borderRadius: 20,
		backgroundColor: colors.surface,
		alignItems: 'center',justifyContent: 'center',
		borderWidth: 1,borderColor: colors.border,
		...shadows.small,
	},

	header: {marginBottom: spacing.xl},
	screenTitle: {...textStyles.headingLarge,marginBottom: spacing.xs},
	screenSub: {...textStyles.bodyMedium,color: colors.textSecondary},

	formCard: {
		backgroundColor: colors.surface,
		borderRadius: borderRadius.xxl,
		padding: spacing.xl,
		gap: spacing.xl,
		borderWidth: 1,
		borderColor: colors.border,
		...shadows.soft,
		marginBottom: spacing.xl,
	},

	// Role
	label: {...textStyles.bodyMedium,color: colors.textSecondary,fontWeight: '500',marginBottom: spacing.sm},
	roleSection: {gap: spacing.xs},
	roleRow: {flexDirection: 'row',gap: spacing.sm},
	roleChip: {
		flex: 1,alignItems: 'center',justifyContent: 'center',
		paddingVertical: spacing.md,
		borderRadius: borderRadius.large,
		backgroundColor: colors.surfaceMuted,
		borderWidth: 1.5,borderColor: colors.border,
	},
	roleChipActive: {
		backgroundColor: colors.lavenderSoft,
		borderColor: colors.primary,
	},
	roleChipText: {...textStyles.bodyMedium,fontWeight: '600',color: colors.textSecondary},
	roleChipTextActive: {color: colors.primary},

	// Language
	inputWrap: {
		flexDirection: 'row',alignItems: 'center',
		backgroundColor: colors.surface,
		borderRadius: borderRadius.large,
		borderWidth: 1.5,borderColor: colors.border,
		paddingHorizontal: spacing.md,
		height: 56,gap: spacing.sm,
		...shadows.small,
	},
	langText: {flex: 1,...textStyles.bodyLarge,color: colors.textPrimary},
	dropdown: {
		backgroundColor: colors.surface,
		borderRadius: borderRadius.large,
		borderWidth: 1,borderColor: colors.border,
		marginTop: spacing.xs,
		overflow: 'hidden',
		...shadows.medium,
	},
	dropdownItem: {
		flexDirection: 'row',alignItems: 'center',
		padding: spacing.md,gap: spacing.sm,
		borderBottomWidth: 1,borderBottomColor: colors.border,
	},
	dropdownItemActive: {backgroundColor: colors.lavenderSoft},
	dropdownText: {flex: 1,...textStyles.bodyMedium,color: colors.textPrimary},

	ctaWrap: {},
	ctaBtn: {
		backgroundColor: colors.primary,
		borderRadius: borderRadius.large,
		height: 56,
		flexDirection: 'row',
		alignItems: 'center',justifyContent: 'center',
		gap: spacing.sm,
		...shadows.medium,
	},
	ctaText: {...textStyles.button,color: colors.surface,fontSize: 16},
});
