import React,{useState,useRef,useEffect} from 'react';
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Dimensions,
	Modal,
	FlatList,
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

const {width: SW,height: SH}=Dimensions.get('window');

// ─── Step Progress (shared) ──────────────────────────────────────────────────
const StepProgress=({current,total=4}: {current: number; total?: number}) =>(
	<View style={spStyles.wrapper}>
		{Array.from({length: total}).map((_,i) =>(
			<React.Fragment key={i}>
				<View style={[spStyles.dot,i+1<=current&&spStyles.dotActive]}>
					{i+1<current
						? <Icon name="check" size={12} color={colors.surface} />
						:<Text style={[spStyles.dotNum,i+1===current&&spStyles.dotNumActive]}>{i+1}</Text>}
				</View>
				{i<total-1&&<View style={[spStyles.line,i+1<current&&spStyles.lineActive]} />}
			</React.Fragment>
		))}
	</View>
);
const spStyles=StyleSheet.create({
	wrapper: {flexDirection: 'row',alignItems: 'center',justifyContent: 'center',marginBottom: spacing.xl},
	dot: {width: 28,height: 28,borderRadius: 14,backgroundColor: colors.surfaceMuted,alignItems: 'center',justifyContent: 'center',borderWidth: 1.5,borderColor: colors.border},
	dotActive: {backgroundColor: colors.primary,borderColor: colors.primary},
	dotNum: {fontSize: 12,fontWeight: '600',color: colors.textMuted},
	dotNumActive: {color: colors.surface},
	line: {flex: 1,height: 2,backgroundColor: colors.border,marginHorizontal: 4},
	lineActive: {backgroundColor: colors.primary},
});

// ─── Grade list ──────────────────────────────────────────────────────────────
const GRADES=['Kindergarten',...Array.from({length: 12},(_,i) =>`Grade ${i+1}`)];

// ─── Date Picker Sheet ────────────────────────────────────────────────────────
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const currentYear=new Date().getFullYear();
const YEARS=Array.from({length: 20},(_,i) =>currentYear-i);

const SHEET_ANIM_CFG={duration: 320,easing: Easing.out(Easing.cubic)};

const DatePickerSheet=({
	visible,
	initialDate,
	onDone,
	onClose,
}: {
	visible: boolean;
	initialDate: Date;
	onDone: (d: Date) =>void;
	onClose: () =>void;
}) =>{
	const [day,setDay]=useState(initialDate.getDate());
	const [month,setMonth]=useState(initialDate.getMonth());
	const [year,setYear]=useState(initialDate.getFullYear());
	const sheetY=useSharedValue(SH);

	useEffect(() =>{
		sheetY.value=withTiming(visible? 0:SH,SHEET_ANIM_CFG);
	},[visible]);

	const sheetStyle=useAnimatedStyle(() =>({transform: [{translateY: sheetY.value}]}));
	const maxDay=new Date(year,month+1,0).getDate();
	const days=Array.from({length: maxDay},(_,i) =>i+1);

	const renderColumn=(
		data: (string|number)[],
		selected: number|string,
		onSelect: (v: any) =>void,
		keyPrefix: string,
	) =>(
		<FlatList
			data={data}
			keyExtractor={(item,i) =>`${keyPrefix}-${i}`}
			showsVerticalScrollIndicator={false}
			style={styles.pickerCol}
			contentContainerStyle={{paddingVertical: 56}}
			initialScrollIndex={data.indexOf(selected)>0? data.indexOf(selected):0}
			getItemLayout={(_,index) =>({length: 44,offset: 44*index,index})}
			renderItem={({item}) =>{
				const isSelected=item===selected;
				return (
					<Pressable
						style={[styles.pickerItem,isSelected&&styles.pickerItemActive]}
						onPress={() =>{onSelect(item); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);}}
					>
						<Text style={[styles.pickerItemText,isSelected&&styles.pickerItemTextActive]}>
							{item}
						</Text>
					</Pressable>
				);
			}}
		/>
	);

	if(!visible) return null;

	return (
		<Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
			<Pressable style={styles.modalOverlay} onPress={onClose} />
			<Animated.View style={[styles.pickerSheet,sheetStyle]}>
				<View style={styles.pickerHandle} />
				<View style={styles.pickerHeader}>
					<Pressable onPress={onClose} style={styles.pickerHeaderBtn}>
						<Text style={styles.pickerCancel}>Cancel</Text>
					</Pressable>
					<Text style={styles.pickerTitle}>Date of Birth</Text>
					<Pressable onPress={() =>{onDone(new Date(year,month,day)); onClose();}} style={styles.pickerHeaderBtn}>
						<Text style={styles.pickerDone}>Done</Text>
					</Pressable>
				</View>
				{/* Column headers */}
				<View style={styles.pickerColHeaders}>
					<Text style={styles.pickerColHeaderText}>Day</Text>
					<Text style={styles.pickerColHeaderText}>Month</Text>
					<Text style={styles.pickerColHeaderText}>Year</Text>
				</View>
				<View style={styles.pickerBody}>
					{renderColumn(days,day,setDay,'day')}
					{renderColumn(MONTHS,MONTHS[month],(v: string) =>setMonth(MONTHS.indexOf(v)),'month')}
					{renderColumn(YEARS,year,setYear,'year')}
				</View>
				{/* Selection highlight bar */}
				<View style={styles.pickerSelector} pointerEvents="none" />
			</Animated.View>
		</Modal>
	);
};

// ─── Grade Bottom Sheet ───────────────────────────────────────────────────────
const GradeSheet=({
	visible,
	selected,
	onSelect,
	onClose,
}: {
	visible: boolean;
	selected: string;
	onSelect: (g: string) =>void;
	onClose: () =>void;
}) =>{
	const sheetY=useSharedValue(SH);
	useEffect(() =>{
		sheetY.value=withTiming(visible? 0:SH,SHEET_ANIM_CFG);
	},[visible]);
	const sheetStyle=useAnimatedStyle(() =>({transform: [{translateY: sheetY.value}]}));

	if(!visible) return null;
	return (
		<Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
			<Pressable style={styles.modalOverlay} onPress={onClose} />
			<Animated.View style={[styles.gradeSheet,sheetStyle]}>
				<View style={styles.pickerHandle} />
				<View style={styles.gradeSheetHeader}>
					<Text style={styles.gradeSheetTitle}>Select Grade</Text>
					<Pressable onPress={onClose} style={styles.gradeSheetClose}>
						<Icon name="close" size={22} color={colors.textSecondary} />
					</Pressable>
				</View>
				<ScrollView showsVerticalScrollIndicator={false} style={{maxHeight: SH*0.55}}>
					{GRADES.map((g,i) =>(
						<React.Fragment key={g}>
							<Pressable
								style={[styles.gradeItem,selected===g&&styles.gradeItemActive]}
								onPress={() =>{onSelect(g); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onClose();}}
							>
								<Text style={[styles.gradeText,selected===g&&styles.gradeTextActive]}>{g}</Text>
								{selected===g&&<Icon name="check" size={18} color={colors.primary} />}
							</Pressable>
							{i<GRADES.length-1&&<View style={styles.gradeDivider} />}
						</React.Fragment>
					))}
				</ScrollView>
			</Animated.View>
		</Modal>
	);
};

// ─── Gender Toggle ────────────────────────────────────────────────────────────
const GENDERS=[
	{key: 'boy',label: 'Boy',emoji: '👦'},
	{key: 'girl',label: 'Girl',emoji: '👧'},
	{key: 'other',label: 'Other',emoji: '🧒'},
];

// ─── Main Screen ─────────────────────────────────────────────────────────────
interface Props {navigation: any;}

export function OnboardingScreen3({navigation}: Props) {
	const [childName,setChildName]=useState('');
	const [dob,setDob]=useState(new Date(currentYear-8,0,1));
	const [showDatePicker,setShowDatePicker]=useState(false);
	const [grade,setGrade]=useState('');
	const [showGradeSheet,setShowGradeSheet]=useState(false);
	const [gender,setGender]=useState<string|null>(null);

	const ageYears=Math.floor((Date.now()-dob.getTime())/(1000*60*60*24*365.25));
	const formattedDob=`${dob.getDate()} ${MONTHS_SHORT[dob.getMonth()]} ${dob.getFullYear()}`;

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
		navigation.navigate('Onboarding4');
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
							<StepProgress current={3} />
						</Animated.View>

						{/* Header */}
						<Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.header}>
							<Text style={styles.screenTitle}>Add Your Child</Text>
							<Text style={styles.screenSub}>We'll personalize the experience for your little one</Text>
						</Animated.View>

						{/* Form card */}
						<Animated.View entering={FadeInDown.duration(450).delay(180)} style={styles.formCard}>
							{/* Child name */}
							<InputField
								label="Child's Full Name"
								value={childName}
								onChangeText={setChildName}
								placeholder="e.g. Arya Sharma"
								leftIcon={<Icon name="child-care" size={20} color={colors.textMuted} />}
							/>

							{/* Date of Birth */}
							<View>
								<Text style={styles.label}>Date of Birth</Text>
								<Pressable style={styles.inputWrap} onPress={() =>{setShowDatePicker(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);}}>
									<Icon name="cake" size={20} color={colors.textMuted} />
									<Text style={styles.inputText}>{formattedDob}</Text>
									<View style={styles.ageBadge}>
										<Text style={styles.ageBadgeText}>Age {ageYears}</Text>
									</View>
									<Icon name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
								</Pressable>
							</View>

							{/* Grade */}
							<View>
								<Text style={styles.label}>Class / Grade</Text>
								<Pressable style={styles.inputWrap} onPress={() =>{setShowGradeSheet(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);}}>
									<Icon name="school" size={20} color={colors.textMuted} />
									<Text style={[styles.inputText,!grade&&{color: colors.textMuted}]}>
										{grade||'Select grade…'}
									</Text>
									<Icon name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
								</Pressable>
							</View>

							{/* Gender */}
							<View>
								<Text style={styles.label}>Gender</Text>
								<View style={styles.genderRow}>
									{GENDERS.map(g =>(
										<Pressable
											key={g.key}
											style={[styles.genderChip,gender===g.key&&styles.genderChipActive]}
											onPress={() =>{setGender(g.key); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);}}
										>
											<Text style={styles.genderEmoji}>{g.emoji}</Text>
											<Text style={[styles.genderLabel,gender===g.key&&styles.genderLabelActive]}>{g.label}</Text>
										</Pressable>
									))}
								</View>
							</View>

							{/* Info banner */}
							<View style={styles.infoBanner}>
								<View style={styles.infoBannerBar} />
								<View style={styles.infoBannerContent}>
									<Icon name="info-outline" size={16} color={colors.growth} />
									<Text style={styles.infoBannerText}>
										More children can be added from your Profile page
									</Text>
								</View>
							</View>
						</Animated.View>

						{/* CTA */}
						<Animated.View entering={FadeInUp.duration(400).delay(350)}>
							<Pressable
								style={({pressed}) =>[styles.ctaBtn,{opacity: pressed? 0.85:1}]}
								onPress={goNext}
							>
								<Text style={styles.ctaText}>Add Child & Continue</Text>
								<Icon name="arrow-forward" size={20} color={colors.surface} />
							</Pressable>
						</Animated.View>
					</ScrollView>
				</Animated.View>
			</KeyboardAvoidingView>

			{/* Date Picker Sheet */}
			<DatePickerSheet
				visible={showDatePicker}
				initialDate={dob}
				onDone={(d) =>setDob(d)}
				onClose={() =>setShowDatePicker(false)}
			/>

			{/* Grade Sheet */}
			<GradeSheet
				visible={showGradeSheet}
				selected={grade}
				onSelect={setGrade}
				onClose={() =>setShowGradeSheet(false)}
			/>
		</SafeAreaView>
	);
}

const styles=StyleSheet.create({
	safe: {flex: 1,backgroundColor: colors.background},
	scroll: {flexGrow: 1,paddingHorizontal: spacing.md,paddingBottom: spacing.xxl},

	backBtn: {paddingTop: spacing.sm,marginBottom: spacing.md},
	backCircle: {
		width: 40,height: 40,borderRadius: 20,
		backgroundColor: colors.surface,alignItems: 'center',justifyContent: 'center',
		borderWidth: 1,borderColor: colors.border,...shadows.small,
	},

	header: {marginBottom: spacing.xl},
	screenTitle: {...textStyles.headingLarge,marginBottom: spacing.xs},
	screenSub: {...textStyles.bodyMedium,color: colors.textSecondary},

	formCard: {
		backgroundColor: colors.surface,
		borderRadius: borderRadius.xxl,
		padding: spacing.xl,
		gap: spacing.xl,
		borderWidth: 1,borderColor: colors.border,
		...shadows.soft,marginBottom: spacing.xl,
	},

	label: {...textStyles.bodyMedium,color: colors.textSecondary,fontWeight: '500',marginBottom: spacing.sm},

	inputWrap: {
		flexDirection: 'row',alignItems: 'center',
		backgroundColor: colors.surface,
		borderRadius: borderRadius.large,
		borderWidth: 1.5,borderColor: colors.border,
		paddingHorizontal: spacing.md,
		height: 56,gap: spacing.sm,...shadows.small,
	},
	inputText: {flex: 1,...textStyles.bodyLarge,color: colors.textPrimary},
	ageBadge: {
		backgroundColor: colors.lavenderSoft,
		borderRadius: borderRadius.full,
		paddingHorizontal: spacing.sm,
		paddingVertical: 3,
		marginRight: spacing.xs,
	},
	ageBadgeText: {fontSize: 12,fontWeight: '700',color: colors.primary},

	// Gender
	genderRow: {flexDirection: 'row',gap: spacing.sm},
	genderChip: {
		flex: 1,alignItems: 'center',justifyContent: 'center',
		paddingVertical: spacing.md,
		borderRadius: borderRadius.large,
		backgroundColor: colors.surfaceMuted,
		borderWidth: 1.5,borderColor: colors.border,
		gap: spacing.xs,
	},
	genderChipActive: {backgroundColor: colors.lavenderSoft,borderColor: colors.primary},
	genderEmoji: {fontSize: 24},
	genderLabel: {...textStyles.bodyMedium,fontWeight: '600',color: colors.textSecondary},
	genderLabelActive: {color: colors.primary},

	// Info banner
	infoBanner: {
		flexDirection: 'row',
		backgroundColor: colors.mintSoft,
		borderRadius: borderRadius.medium,
		overflow: 'hidden',
		minHeight: 52,
	},
	infoBannerBar: {width: 3,backgroundColor: colors.growth},
	infoBannerContent: {
		flex: 1,flexDirection: 'row',alignItems: 'center',
		paddingHorizontal: spacing.md,paddingVertical: spacing.sm,gap: spacing.sm,
	},
	infoBannerText: {flex: 1,...textStyles.caption,color: colors.growth,fontWeight: '500',lineHeight: 18},

	// CTA
	ctaBtn: {
		backgroundColor: colors.primary,borderRadius: borderRadius.large,
		height: 56,flexDirection: 'row',alignItems: 'center',justifyContent: 'center',
		gap: spacing.sm,...shadows.medium,
	},
	ctaText: {...textStyles.button,color: colors.surface,fontSize: 16},

	// Date Picker Sheet — clean list style
	modalOverlay: {...StyleSheet.absoluteFillObject,backgroundColor: 'rgba(0,0,0,0.45)'},
	pickerSheet: {
		position: 'absolute',bottom: 0,left: 0,right: 0,
		backgroundColor: colors.surface,
		borderTopLeftRadius: borderRadius.xxl,
		borderTopRightRadius: borderRadius.xxl,
		paddingBottom: spacing.xxl+20,
	},
	pickerHandle: {
		width: 40,height: 4,borderRadius: 2,
		backgroundColor: colors.border,
		alignSelf: 'center',marginTop: spacing.sm,marginBottom: spacing.md,
	},
	pickerHeader: {
		flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',
		paddingHorizontal: spacing.lg,paddingBottom: spacing.md,
		borderBottomWidth: 1,borderBottomColor: colors.border,
	},
	pickerHeaderBtn: {minWidth: 60},
	pickerTitle: {...textStyles.headingMedium,textAlign: 'center'},
	pickerCancel: {...textStyles.bodyMedium,color: colors.textSecondary},
	pickerDone: {...textStyles.bodyMedium,color: colors.primary,fontWeight: '700',textAlign: 'right'},
	pickerColHeaders: {
		flexDirection: 'row',
		paddingHorizontal: spacing.md,
		paddingTop: spacing.md,
		paddingBottom: spacing.xs,
	},
	pickerColHeaderText: {
		flex: 1,textAlign: 'center',
		...textStyles.caption,
		color: colors.textMuted,
		fontWeight: '600',
		letterSpacing: 0.5,
		textTransform: 'uppercase',
	},
	pickerBody: {flexDirection: 'row',height: 200},
	pickerCol: {flex: 1},
	pickerItem: {
		height: 44,alignItems: 'center',justifyContent: 'center',
	},
	pickerItemActive: {
		backgroundColor: colors.lavenderSoft,borderRadius: borderRadius.small,
		marginHorizontal: spacing.xs,
	},
	pickerItemText: {...textStyles.bodyMedium,color: colors.textSecondary},
	pickerItemTextActive: {color: colors.primary,fontWeight: '700',...textStyles.bodyLarge},
	pickerSelector: {
		position: 'absolute',left: spacing.sm,right: spacing.sm,
		top: 44+spacing.md+spacing.xs+spacing.md+spacing.xs+78, // below header+colheader
		height: 44,
		borderTopWidth: 1,borderBottomWidth: 1,
		borderColor: colors.border,
	},

	// Grade Sheet
	gradeSheet: {
		position: 'absolute',bottom: 0,left: 0,right: 0,
		backgroundColor: colors.surface,
		borderTopLeftRadius: borderRadius.xxl,
		borderTopRightRadius: borderRadius.xxl,
		paddingBottom: spacing.xxl+20,
		paddingTop: spacing.sm,
	},
	gradeSheetHeader: {
		flexDirection: 'row',alignItems: 'center',
		paddingHorizontal: spacing.xl,paddingVertical: spacing.md,
		borderBottomWidth: 1,borderBottomColor: colors.border,
	},
	gradeSheetTitle: {
		...textStyles.headingMedium,
		flex: 1,
	},
	gradeSheetClose: {padding: 4},
	gradeItem: {
		flexDirection: 'row',alignItems: 'center',
		paddingHorizontal: spacing.xl,paddingVertical: spacing.md+2,
		gap: spacing.sm,
	},
	gradeItemActive: {backgroundColor: colors.lavenderSoft},
	gradeText: {flex: 1,...textStyles.bodyLarge,color: colors.textPrimary},
	gradeTextActive: {color: colors.primary,fontWeight: '600'},
	gradeDivider: {height: 1,backgroundColor: colors.border,marginHorizontal: spacing.xl},
});
