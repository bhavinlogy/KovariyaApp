import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	Pressable,
	Platform,
	StatusBar as RNStatusBar,
	useWindowDimensions,
	TextInput,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {setStatusBarStyle} from 'expo-status-bar';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView,useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg,{Circle,Polyline,Line,Text as SvgText} from 'react-native-svg';
import Animated,{
	FadeInDown,
	FadeIn,
	useAnimatedStyle,
	useAnimatedProps,
	useSharedValue,
	withTiming,
	withDelay,
	withSpring,
	Easing,
} from 'react-native-reanimated';

const AnimatedCircle=Animated.createAnimatedComponent(Circle);
const AnimatedTextInput=Animated.createAnimatedComponent(TextInput);

function AnimatedNumber({
	value,
	delay=0,
	duration=1200,
	style,
	prefix='',
	suffix='%',
}: {
	value: number;
	delay?: number;
	duration?: number;
	style?: any;
	prefix?: string;
	suffix?: string;
}) {
	const progress=useSharedValue(0);

	useEffect(() => {
		progress.value=0;
		progress.value=withDelay(
			delay,
			withTiming(value,{duration,easing: Easing.out(Easing.cubic)})
		);
	},[value,delay,duration,progress]);

	const animProps=useAnimatedProps(() => {
		return {
			text: `${prefix}${Math.round(progress.value)}${suffix}`,
		} as any;
	});

	return (
		<AnimatedTextInput
			editable={false}
			animatedProps={animProps}
			defaultValue={`${prefix}0${suffix}`}
			style={[style,{padding: 0,margin: 0}]}
		/>
	);
}

import {AppGradientHeader,Card,ProgressCircle} from '../components';
import {
	colors,
	spacing,
	textStyles,
	borderRadius,
	getFloatingTabBarBottomPadding,
} from '../theme';
import {useChildren} from '../context/ChildrenContext';
import {
	getSdsAnalytics,
	getFamilyScore,
	getTrustMeter,
	getAspectScores,
	getWeeklyGraph,
	getMonthlyGraph,
	getGuidance,
	getBadges,
	getStrengthsWeaknesses,
	type SdsAnalytics,
	type FamilyScoreData,
	type TrustMeterData,
	type AspectScoreRow,
	type WeeklyGraphRow,
	type MonthlyGraphRow,
	type GuidanceItem,
	type BadgeItem,
} from '../data/analyticsData';
import {DASHBOARD_RATING_ASPECTS} from '../data/aspectRating';

/* ─── Animated Bar ─── */
function AnimatedBar({
	targetHeight,
	color,
	delay=0,
	width=18,
	maxHeight=120,
}: {
	targetHeight: number;
	color: string;
	delay?: number;
	width?: number;
	maxHeight?: number;
}) {
	const height=useSharedValue(0);

	useEffect(() => {
		height.value=0;
		height.value=withDelay(
			delay,
			withSpring(targetHeight,{damping: 18,stiffness: 140})
		);
	},[targetHeight,delay,height]);

	const animStyle=useAnimatedStyle(() => ({
		height: height.value,
	}));

	return (
		<Animated.View
			style={[
				{
					width,
					maxHeight,
					borderRadius: width/2,
					backgroundColor: color,
				},
				animStyle,
			]}
		/>
	);
}

/* ─── Animated Progress Bar (horizontal) ─── */
function AnimatedProgressBar({
	percent,
	fillColor,
	trackColor=colors.border,
	delay=0,
	height=8,
}: {
	percent: number;
	fillColor: string;
	trackColor?: string;
	delay?: number;
	height?: number;
}) {
	const progress=useSharedValue(0);

	useEffect(() => {
		progress.value=0;
		progress.value=withDelay(
			delay,
			withTiming(Math.min(100,Math.max(0,percent)),{
				duration: 1000,
				easing: Easing.out(Easing.cubic),
			})
		);
	},[percent,delay,progress]);

	const fillStyle=useAnimatedStyle(() => ({
		width: `${progress.value}%`,
	}));

	return (
		<View
			style={[
				styles.progressBarTrack,
				{backgroundColor: trackColor,height,borderRadius: height/2},
			]}
		>
			<Animated.View
				style={[
					styles.progressBarFill,
					{backgroundColor: fillColor,borderRadius: height/2},
					fillStyle,
				]}
			/>
		</View>
	);
}

/* ─── SDS Card (matching dashboard design) ─── */
type SdsMoodKey='win'|'lose'|'flat';

function getSdsMood(trend: number) {
	if(trend>0) {
		return {
			mood: 'win' as SdsMoodKey,
			gradient: ['#E8FFF4','#A8E8C8','#3FA97A'] as const,
			titleColor: 'rgba(13, 61, 42, 0.72)',
			numberColor: '#0A3020',
			hintColor: 'rgba(13, 61, 42, 0.62)',
			trendColor: '#0F5C3D',
			barFill: '#1F7A55',
			barTrack: 'rgba(255, 255, 255, 0.72)',
			borderColor: 'rgba(63, 169, 122, 0.35)',
			badge: 'Winning week',
			badgeBg: 'rgba(255, 255, 255, 0.92)',
			badgeText: '#145A3D',
			badgeIcon: 'emoji-events',
		};
	}
	if(trend<0) {
		return {
			mood: 'lose' as SdsMoodKey,
			gradient: [...colors.failureGradient] as const,
			titleColor: 'rgba(74, 28, 28, 0.75)',
			numberColor: '#3D1818',
			hintColor: 'rgba(74, 28, 28, 0.65)',
			trendColor: '#8B2323',
			barFill: '#B54545',
			barTrack: 'rgba(255, 255, 255, 0.55)',
			borderColor: 'rgba(200, 92, 92, 0.4)',
			badge: 'Room to grow',
			badgeBg: 'rgba(255, 255, 255, 0.88)',
			badgeText: '#7A2828',
			badgeIcon: 'trending-down',
		};
	}
	return {
		mood: 'flat' as SdsMoodKey,
		gradient: [...colors.neutralSdsGradient] as const,
		titleColor: colors.textSecondary,
		numberColor: colors.ink,
		hintColor: colors.textSecondary,
		trendColor: colors.textSecondary,
		barFill: colors.primary,
		barTrack: 'rgba(255, 255, 255, 0.65)',
		borderColor: 'rgba(124, 106, 232, 0.2)',
		badge: 'Holding steady',
		badgeBg: 'rgba(255, 255, 255, 0.9)',
		badgeText: colors.textSecondary,
		badgeIcon: 'trending-flat',
	};
}

/* ─── Half-Pie Chart (semicircle gauge) for SDS ─── */
function HalfPieChart({
	percent,
	size=160,
	strokeWidth=14,
	fillColor,
	trackColor,
	label,
	trendNode,
}: {
	percent: number;
	size?: number;
	strokeWidth?: number;
	fillColor: string;
	trackColor: string;
	label?: string;
	trendNode?: React.ReactNode;
}) {
	const radius=(size-strokeWidth)/2;
	const halfCircumference=Math.PI*radius; // half circle
	const clamped=Math.min(100,Math.max(0,percent));

	const animProgress=useSharedValue(0);

	useEffect(() => {
		animProgress.value=0;
		animProgress.value=withDelay(
			200,
			withTiming(clamped,{duration: 1200,easing: Easing.out(Easing.cubic)})
		);
	},[clamped,animProgress]);

	const animProps=useAnimatedProps(() => {
		const offset=halfCircumference-(animProgress.value/100)*halfCircumference;
		return {strokeDashoffset: offset};
	});

	return (
		<View style={styles.halfPieWrap}>
			<Svg width={size} height={size/2+strokeWidth/2}>
				{/* Track (background semicircle) */}
				<Circle
					cx={size/2}
					cy={size/2}
					r={radius}
					stroke={trackColor}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeLinecap="round"
					strokeDasharray={`${halfCircumference} ${halfCircumference*2}`}
					transform={`rotate(180 ${size/2} ${size/2})`}
				/>
				{/* Fill (animated semicircle) */}
				<AnimatedCircle
					cx={size/2}
					cy={size/2}
					r={radius}
					stroke={fillColor}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeLinecap="round"
					strokeDasharray={`${halfCircumference} ${halfCircumference*2}`}
					transform={`rotate(180 ${size/2} ${size/2})`}
					animatedProps={animProps}
				/>
			</Svg>
			{/* Center content below arc */}
			<View
				style={[
					styles.halfPieCenter,
					{top: size/2-strokeWidth*2.5},
				]}
			>
				{trendNode}
			</View>
		</View>
	);
}

/* ─── Animated Donut Chart (full circle) for FS & Trust ─── */
function AnimatedDonutChart({
	percent,
	size=92,
	strokeWidth=10,
	fillColor,
	trackColor='rgba(0,0,0,0.06)',
	valueLabel,
	valueColor,
	delay=0,
}: {
	percent: number;
	size?: number;
	strokeWidth?: number;
	fillColor: string;
	trackColor?: string;
	valueLabel: string;
	valueColor: string;
	delay?: number;
}) {
	const radius=(size-strokeWidth)/2;
	const circumference=2*Math.PI*radius;
	const clamped=Math.min(100,Math.max(0,percent));

	const animProgress=useSharedValue(0);

	useEffect(() => {
		animProgress.value=0;
		animProgress.value=withDelay(
			delay,
			withTiming(clamped,{duration: 1100,easing: Easing.out(Easing.cubic)})
		);
	},[clamped,delay,animProgress]);

	const animProps=useAnimatedProps(() => {
		const offset=circumference-(animProgress.value/100)*circumference;
		return {strokeDashoffset: offset};
	});

	return (
		<View style={[styles.donutWrap,{width: size,height: size}]}>
			<Svg width={size} height={size}>
				{/* Track circle */}
				<Circle
					cx={size/2}
					cy={size/2}
					r={radius}
					stroke={trackColor}
					strokeWidth={strokeWidth}
					fill="transparent"
				/>
				{/* Animated fill */}
				<AnimatedCircle
					cx={size/2}
					cy={size/2}
					r={radius}
					stroke={fillColor}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeLinecap="round"
					strokeDasharray={`${circumference}`}
					transform={`rotate(-90 ${size/2} ${size/2})`}
					animatedProps={animProps}
				/>
			</Svg>
			{/* Center value */}
			<View style={styles.donutCenterLabel}>
				<AnimatedNumber
					value={clamped}
					suffix="%"
					delay={delay}
					duration={1100}
					style={[styles.donutCenterValue,{color: valueColor, textAlign: 'center'}]}
				/>
			</View>
		</View>
	);
}

/* ─── Monthly Line Chart ─── */
const MONTHLY_PAD={l: 36,r: 14,t: 10,b: 24};
const MONTHLY_PLOT_H=120;
const MONTHLY_Y_TICKS=[100,75,50,25];

function MonthlyLineChart({data}: {data: MonthlyGraphRow[]}) {
	const {width: windowWidth}=useWindowDimensions();
	const chartW=Math.max(220,windowWidth-spacing.lg*2-spacing.md*2);
	const plotW=chartW-MONTHLY_PAD.l-MONTHLY_PAD.r;
	const plotH=MONTHLY_PLOT_H;
	const svgH=MONTHLY_PAD.t+plotH+MONTHLY_PAD.b;
	const n=data.length;

	const seriesConfig=[
		{key: 'sds' as const,color: colors.primary,label: 'SDS'},
		{key: 'fs' as const,color: colors.growth,label: 'FS'},
		{key: 'trust' as const,color: colors.accent,label: 'Trust'},
	];

	const buildPts=(vals: number[]) =>
		vals.map((v,i) => ({
			x: MONTHLY_PAD.l+(n<=1? plotW/2:(i/(n-1))*plotW),
			y: MONTHLY_PAD.t+(1-v/100)*plotH,
		}));

	return (
		<View>
			<View style={{height: svgH}}>
				<Svg width={chartW} height={svgH}>
					{MONTHLY_Y_TICKS.map((tick) => {
						const y=MONTHLY_PAD.t+(1-tick/100)*plotH;
						return (
							<React.Fragment key={tick}>
								<Line
									x1={MONTHLY_PAD.l}
									y1={y}
									x2={MONTHLY_PAD.l+plotW}
									y2={y}
									stroke={colors.border}
									strokeWidth={0.5}
									strokeDasharray="4 6"
									opacity={0.85}
								/>
								<SvgText
									x={MONTHLY_PAD.l-6}
									y={y+4}
									fontSize={10}
									fill={colors.textMuted}
									textAnchor="end"
								>
									{tick}
								</SvgText>
							</React.Fragment>
						);
					})}

					{seriesConfig.map(({key,color}) => {
						const vals=data.map((d) => d[key]);
						const pts=buildPts(vals);
						const pointsStr=pts.map((p) => `${p.x},${p.y}`).join(' ');
						return (
							<React.Fragment key={key}>
								<Polyline
									points={pointsStr}
									fill="none"
									stroke={color}
									strokeWidth={2.5}
									strokeLinejoin="round"
									strokeLinecap="round"
									opacity={0.9}
								/>
								{pts.map((p,i) => (
									<Circle
										key={`${key}-${i}`}
										cx={p.x}
										cy={p.y}
										r={4}
										fill={color}
										stroke={colors.surface}
										strokeWidth={2}
									/>
								))}
							</React.Fragment>
						);
					})}

					{data.map((d,i) => {
						const x=
							n<=1
								? MONTHLY_PAD.l+plotW/2
								:MONTHLY_PAD.l+(i/(n-1))*plotW;
						return (
							<SvgText
								key={d.week}
								x={x}
								y={svgH-6}
								fontSize={10}
								fill={colors.textSecondary}
								textAnchor="middle"
							>
								{`W${i+1}`}
							</SvgText>
						);
					})}
				</Svg>
			</View>

			<View style={styles.monthlyLegend}>
				{seriesConfig.map(({color,label}) => (
					<View key={label} style={styles.legendChip}>
						<View style={[styles.legendDot,{backgroundColor: color}]} />
						<Text style={styles.legendChipText}>{label}</Text>
					</View>
				))}
			</View>
		</View>
	);
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN ANALYTICS SCREEN                                            */
/* ═══════════════════════════════════════════════════════════════════ */

const AnalyticsScreen: React.FC=() => {
	const insets=useSafeAreaInsets();
	const {width: windowWidth}=useWindowDimensions();
	const {children,selectedChildId}=useChildren();

	const scrollBottomPad=useMemo(
		() => getFloatingTabBarBottomPadding(insets.bottom),
		[insets.bottom]
	);

	const selectedChild=useMemo(
		() => children.find((c) => c.id===selectedChildId)??children[0],
		[children,selectedChildId]
	);

	const sds=useMemo(() => getSdsAnalytics(selectedChild.id),[selectedChild.id]);
	const fs=useMemo(() => getFamilyScore(selectedChild.id),[selectedChild.id]);
	const trust=useMemo(() => getTrustMeter(selectedChild.id),[selectedChild.id]);
	const aspects=useMemo(() => getAspectScores(selectedChild.id),[selectedChild.id]);
	const weeklyData=useMemo(() => getWeeklyGraph(selectedChild.id),[selectedChild.id]);
	const monthlyData=useMemo(() => getMonthlyGraph(selectedChild.id),[selectedChild.id]);
	const guidance=useMemo(() => getGuidance(selectedChild.id),[selectedChild.id]);
	const badges=useMemo(() => getBadges(selectedChild.id),[selectedChild.id]);
	const sw=useMemo(
		() => getStrengthsWeaknesses(selectedChild.id),
		[selectedChild.id]
	);

	const sdsMood=useMemo(() => getSdsMood(sds.trend),[sds.trend]);

	const [activeTab,setActiveTab]=useState<'weekly'|'monthly'>('weekly');

	/* Status bar management — match dashboard */
	useFocusEffect(
		useCallback(() => {
			setStatusBarStyle('light');
			if(Platform.OS==='android') {
				RNStatusBar.setTranslucent(true);
				RNStatusBar.setBackgroundColor('transparent');
			}
			return () => {
				setStatusBarStyle('dark');
				if(Platform.OS==='android') {
					RNStatusBar.setTranslucent(false);
					RNStatusBar.setBackgroundColor(colors.background);
				}
			};
		},[])
	);

	/* Aspect tile sizing: 2-2-1 grid */
	const aspectTileMetrics=useMemo(() => {
		const horizontalPadding=spacing.lg*2;
		const G=spacing.md;
		const inner=windowWidth-horizontalPadding;
		const width2=Math.max(140,Math.floor((inner-G)/2));
		const width1=inner;
		return {width2,width1,gap: G};
	},[windowWidth]);

	return (
		<SafeAreaView style={styles.root} edges={['left','right','bottom']}>
			<AppGradientHeader
				title="Progress & Analytics"
				subtitle={`${selectedChild.name}'s insights`}
			/>

			<ScrollView
				style={styles.scroll}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={[
					styles.scrollContent,
					{paddingBottom: scrollBottomPad},
				]}
			>
				{/* ── Section 1: SDS Score Card with Half-Pie ── */}
				<Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
					<View style={styles.heroSds}>
						<LinearGradient
							key={selectedChild.id}
							colors={sdsMood.gradient}
							start={{x: 0,y: 0}}
							end={{x: 1,y: 1}}
							style={[
								styles.sdsCard,
								{borderColor: sdsMood.borderColor},
							]}
						>
							<View style={styles.sdsCardTopRow}>
								<Text style={[styles.sdsCardTitle,{color: sdsMood.titleColor}]}>
									SDS Score
								</Text>
								<View style={[styles.sdsMoodBadge,{backgroundColor: sdsMood.badgeBg}]}>
									<Icon name={sdsMood.badgeIcon} size={15} color={sdsMood.badgeText} />
									<Text style={[styles.sdsMoodBadgeText,{color: sdsMood.badgeText}]}>
										{sdsMood.badge}
									</Text>
								</View>
							</View>

							<HalfPieChart
								percent={sds.percent}
								size={180}
								strokeWidth={16}
								fillColor={sdsMood.barFill}
								trackColor={sdsMood.barTrack}
								trendNode={
									<View style={styles.sdsHalfPieCenterContent}>
										<AnimatedNumber
											value={sds.percent}
											suffix="%"
											delay={200}
											duration={1200}
											style={[styles.sdsBigNumber,{color: sdsMood.numberColor, textAlign: 'center'}]}
										/>
										<View style={styles.sdsWeekCompareRow}>
											<Icon
												name={
													sds.trend>0
														? 'trending-up'
														:sds.trend<0
															? 'trending-down'
															:'trending-flat'
												}
												size={16}
												color={sdsMood.trendColor}
											/>
											<Text
												style={[
													styles.sdsTrendSmall,
													{color: sdsMood.trendColor},
												]}
											>
												{sds.trend>0
													? `+${sds.trend}%`
													:sds.trend<0
														? `${sds.trend}%`
														:'0%'}
												<Text
													style={[
														styles.sdsWeekVsText,
														{color: sdsMood.hintColor},
													]}
												>
													{' '}vs last week
												</Text>
											</Text>
										</View>
									</View>
								}
							/>
						</LinearGradient>
					</View>
				</Animated.View>

				{/* ── Section 2: Quick Metrics with Donut Charts (FS + Trust) ── */}
				<Animated.View
					entering={FadeInDown.delay(80).springify().damping(18).stiffness(220)}
				>
					<View style={styles.metricsRow}>
						{/* Family Score */}
						<View style={styles.metricCard}>
							<Text style={styles.metricLabel}>Family Score</Text>
							<AnimatedDonutChart
								percent={fs.score}
								size={100}
								strokeWidth={12}
								fillColor={colors.growth}
								trackColor="rgba(63, 169, 122, 0.12)"
								valueLabel={`${fs.score}%`}
								valueColor={colors.growth}
								delay={100}
							/>
							<View style={styles.metricTrendRow}>
								<Icon
									name={fs.trend>=0? 'trending-up':'trending-down'}
									size={14}
									color={fs.trend>=0? colors.growth:colors.error}
								/>
								<Text
									style={[
										styles.metricTrendText,
										{color: fs.trend>=0? colors.growth:colors.error},
									]}
								>
									{fs.trend>=0? '+':''}
									{fs.trend}% vs last week
								</Text>
							</View>
						</View>

						{/* Trust Meter */}
						<View style={styles.metricCard}>
							<Text style={styles.metricLabel}>Trust Meter</Text>
							<AnimatedDonutChart
								percent={trust.level}
								size={100}
								strokeWidth={12}
								fillColor={colors.accent}
								trackColor="rgba(232, 160, 74, 0.12)"
								valueLabel={`${trust.level}%`}
								valueColor={colors.accent}
								delay={250}
							/>
							<View style={styles.trustLabelRow}>
								<View
									style={[
										styles.trustChip,
										{
											backgroundColor:
												trust.level>=80
													? colors.growthLight
													:trust.level>=60
														? colors.accentLight
														:colors.primaryLight,
											borderColor:
												trust.level>=80
													? 'rgba(63, 169, 122, 0.3)'
													:trust.level>=60
														? 'rgba(232, 160, 74, 0.3)'
														:colors.border,
										},
									]}
								>
									<Text
										style={[
											styles.trustChipText,
											{
												color:
													trust.level>=80
														? colors.growth
														:trust.level>=60
															? '#8B5E1A'
															:colors.primary,
											},
										]}
									>
										{trust.label}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</Animated.View>

				{/* ── Section 3: Aspect Scores ── */}
				<Animated.View
					entering={FadeInDown.delay(160).springify().damping(18).stiffness(220)}
				>
					<View style={styles.sectionBlock}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>Aspect Scores</Text>
							<Text style={styles.sectionSubtitle}>This week's breakdown</Text>
						</View>

						<View
							style={[
								styles.aspectsGrid,
								{columnGap: aspectTileMetrics.gap,rowGap: aspectTileMetrics.gap},
							]}
						>
							{aspects.map((aspect,idx) => {
								const tileW=idx<4? aspectTileMetrics.width2:aspectTileMetrics.width1;
								return (
									<View key={aspect.id} style={[styles.aspectTile,{width: tileW}]}>
										<View style={styles.aspectTileHeader}>
											<View
												style={[
													styles.aspectTileIconWrap,
													{backgroundColor: aspect.softBg,borderColor: aspect.borderColor},
												]}
											>
												<Icon name={aspect.iconName} size={14} color={aspect.accent} />
											</View>
											<Text style={styles.aspectTileName} numberOfLines={1}>
												{aspect.name}
											</Text>
										</View>
										<AnimatedDonutChart
											percent={aspect.score}
											size={tileW===aspectTileMetrics.width1? 92:80}
											strokeWidth={8}
											fillColor={aspect.accent}
											trackColor={aspect.softBg}
											valueLabel={`${aspect.score}%`}
											valueColor={aspect.accent}
											delay={idx*80}
										/>
										<View style={styles.aspectTileChangeRow}>
											<Icon
												name={aspect.change>=0? 'trending-up':'trending-down'}
												size={13}
												color={aspect.change>=0? colors.growth:colors.error}
											/>
											<Text
												style={[
													styles.aspectTileChangeText,
													{color: aspect.change>=0? colors.growth:colors.error},
												]}
											>
												{aspect.change>=0? '+':''}
												{aspect.change}% vs last wk
											</Text>
										</View>
									</View>
								);
							})}
						</View>
					</View>
				</Animated.View>

				{/* ── Section 4: Weekly / Monthly Graphs (Tab switch) ── */}
				<Animated.View
					entering={FadeInDown.delay(240).springify().damping(18).stiffness(220)}
				>
					<Card variant="elevated" padding={spacing.md} style={styles.chartCard}>
						<View style={styles.chartHeaderRow}>
							<Text style={styles.chartTitle}>
								{activeTab==='weekly'? 'Weekly Trends':'Monthly Overview'}
							</Text>
						</View>

						{/* Tab Switch */}
						<View style={styles.tabBar}>
							<Pressable
								onPress={() => setActiveTab('weekly')}
								style={[
									styles.tab,
									activeTab==='weekly'&&styles.tabActive,
								]}
							>
								<Icon
									name="bar-chart"
									size={16}
									color={
										activeTab==='weekly'? colors.primary:colors.textMuted
									}
								/>
								<Text
									style={[
										styles.tabLabel,
										activeTab==='weekly'&&styles.tabLabelActive,
									]}
								>
									Weekly
								</Text>
							</Pressable>
							<Pressable
								onPress={() => setActiveTab('monthly')}
								style={[
									styles.tab,
									activeTab==='monthly'&&styles.tabActive,
								]}
							>
								<Icon
									name="show-chart"
									size={16}
									color={
										activeTab==='monthly'? colors.primary:colors.textMuted
									}
								/>
								<Text
									style={[
										styles.tabLabel,
										activeTab==='monthly'&&styles.tabLabelActive,
									]}
								>
									Monthly
								</Text>
							</Pressable>
						</View>

						{activeTab==='weekly'? (
							<View>
								<View style={styles.weeklyBarsContainer}>
									{weeklyData.map((row,i) => (
										<View key={row.day} style={styles.weeklyDayCol}>
											<View style={styles.weeklyBarsGroup}>
												<AnimatedBar
													targetHeight={(row.positive/10)*120}
													color={colors.growth}
													delay={i*60}
													width={14}
													maxHeight={120}
												/>
												<AnimatedBar
													targetHeight={(row.needsWork/10)*120}
													color={colors.error}
													delay={i*60+30}
													width={14}
													maxHeight={120}
												/>
											</View>
											<Text style={styles.weeklyDayLabel}>{row.day}</Text>
										</View>
									))}
								</View>
								<View style={styles.weeklyLegend}>
									<View style={styles.legendChip}>
										<View
											style={[styles.legendDot,{backgroundColor: colors.growth}]}
										/>
										<Text style={styles.legendChipText}>Positive</Text>
									</View>
									<View style={styles.legendChip}>
										<View
											style={[styles.legendDot,{backgroundColor: colors.error}]}
										/>
										<Text style={styles.legendChipText}>Needs Work</Text>
									</View>
								</View>
							</View>
						):(
							<MonthlyLineChart data={monthlyData} />
						)}
					</Card>
				</Animated.View>

				{/* ── Section 5: Strengths & Weak Areas ── */}
				<Animated.View
					entering={FadeInDown.delay(320).springify().damping(18).stiffness(220)}
				>
					<Card variant="elevated" padding={spacing.md} style={styles.insightCard}>
						<View style={styles.insightHeader}>
							<View
								style={[
									styles.insightIconWrap,
									{backgroundColor: colors.growthLight},
								]}
							>
								<Icon name="insights" size={20} color={colors.growth} />
							</View>
							<View style={styles.insightHeaderText}>
								<Text style={styles.insightTitle}>Strengths & Growth Areas</Text>
								<Text style={styles.insightSubtitle}>
									How {selectedChild.name} is doing across key behaviours
								</Text>
							</View>
						</View>

						{/* Strengths */}
						{sw.strengths.length>0&&(
							<View style={styles.swBlock}>
								<View style={styles.swLabelRow}>
									<Icon name="check-circle" size={16} color={colors.growth} />
									<Text style={[styles.swLabel,{color: '#145A3D'}]}>
										Strengths
									</Text>
								</View>
								<Text style={styles.swSummary}>{sw.strengthSummary}</Text>
								<View style={styles.swChips}>
									{sw.strengths.map((s) => (
										<View
											key={s.id}
											style={[
												styles.swChip,
												{
													backgroundColor: s.softBg,
													borderColor: s.borderColor,
												},
											]}
										>
											<Icon name={s.iconName} size={14} color={s.accent} />
											<Text style={[styles.swChipText,{color: s.accent}]}>
												{s.name} · {s.score}%
											</Text>
										</View>
									))}
								</View>
							</View>
						)}

						{/* Weak Areas */}
						{sw.weakAreas.length>0&&(
							<View style={[styles.swBlock,styles.swBlockWeak]}>
								<View style={styles.swLabelRow}>
									<Icon name="flag" size={16} color={colors.warning} />
									<Text style={[styles.swLabel,{color: '#8B4514'}]}>
										Needs Focus
									</Text>
								</View>
								<Text style={styles.swSummary}>{sw.weakSummary}</Text>
								<View style={styles.swChips}>
									{sw.weakAreas.map((s) => (
										<View
											key={s.id}
											style={[
												styles.swChip,
												{
													backgroundColor: colors.peachSoft,
													borderColor: 'rgba(232, 160, 74, 0.35)',
												},
											]}
										>
											<Icon name={s.iconName} size={14} color={colors.warning} />
											<Text style={[styles.swChipText,{color: '#8B4514'}]}>
												{s.name} · {s.score}%
											</Text>
										</View>
									))}
								</View>
							</View>
						)}
					</Card>
				</Animated.View>

				{/* ── Section 6: AI Guidance ── */}
				<Animated.View
					entering={FadeInDown.delay(400).springify().damping(18).stiffness(220)}
				>
					<Card variant="elevated" padding={spacing.md} style={styles.guidanceCard}>
						<View style={styles.guidanceHeader}>
							<View style={styles.guidanceIconWrap}>
								<Icon name="auto-awesome" size={20} color={colors.primaryDark} />
							</View>
							<View style={styles.guidanceHeaderText}>
								<Text style={styles.guidanceTitle}>AI Guidance</Text>
								<Text style={styles.guidanceSubtitle}>
									Personalized tips based on recent data
								</Text>
							</View>
						</View>

						{guidance.map((item,idx) => {
							const iconMap={
								tip: 'lightbulb',
								warning: 'warning-amber',
								suggestion: 'psychology',
							};
							const colorMap={
								tip: colors.growth,
								warning: colors.warning,
								suggestion: colors.primary,
							};
							const bgMap={
								tip: colors.mintSoft,
								warning: colors.peachSoft,
								suggestion: colors.lavenderSoft,
							};
							const borderMap={
								tip: 'rgba(63, 169, 122, 0.25)',
								warning: 'rgba(232, 160, 74, 0.3)',
								suggestion: 'rgba(124, 106, 232, 0.25)',
							};
							return (
								<View
									key={item.id}
									style={[
										styles.guidanceItem,
										{
											backgroundColor: bgMap[item.type],
											borderColor: borderMap[item.type],
										},
										idx===guidance.length-1&&{marginBottom: 0},
									]}
								>
									<View
										style={[
											styles.guidanceItemIcon,
											{
												backgroundColor: colors.surface,
												borderColor: borderMap[item.type],
											},
										]}
									>
										<Icon
											name={iconMap[item.type]}
											size={18}
											color={colorMap[item.type]}
										/>
									</View>
									<View style={styles.guidanceItemText}>
										<Text style={styles.guidanceItemTitle}>{item.title}</Text>
										<Text style={styles.guidanceItemMsg}>{item.message}</Text>
									</View>
								</View>
							);
						})}
					</Card>
				</Animated.View>

				{/* ── Section 7: Badges ── */}
				<Animated.View
					entering={FadeInDown.delay(480).springify().damping(18).stiffness(220)}
				>
					<Card variant="elevated" padding={spacing.md} style={styles.badgesCard}>
						<View style={styles.badgesHeader}>
							<View style={styles.badgesIconWrap}>
								<Icon name="military-tech" size={20} color={colors.accent} />
							</View>
							<View style={styles.badgesHeaderText}>
								<Text style={styles.badgesTitle}>Badges Earned</Text>
								<Text style={styles.badgesSubtitle}>
									{badges.filter((b) => b.earned).length} of {badges.length}{' '}
									unlocked
								</Text>
							</View>
						</View>

						<View style={styles.badgesGrid}>
							{badges.map((badge) => (
								<View
									key={badge.id}
									style={[
										styles.badgeTile,
										!badge.earned&&styles.badgeTileLocked,
									]}
								>
									<View
										style={[
											styles.badgeIconCircle,
											{
												backgroundColor: badge.earned
													? `${badge.color}22`
													:colors.surfaceMuted,
												borderColor: badge.earned
													? `${badge.color}55`
													:colors.border,
											},
										]}
									>
										<Icon
											name={badge.iconName}
											size={22}
											color={badge.earned? badge.color:colors.textMuted}
										/>
									</View>
									<Text
										style={[
											styles.badgeLabel,
											!badge.earned&&styles.badgeLabelLocked,
										]}
										numberOfLines={2}
									>
										{badge.label}
									</Text>
									<Text style={styles.badgeDesc} numberOfLines={2}>
										{badge.description}
									</Text>
									{!badge.earned&&(
										<View style={styles.lockedChip}>
											<Icon name="lock" size={10} color={colors.textMuted} />
											<Text style={styles.lockedChipText}>Locked</Text>
										</View>
									)}
								</View>
							))}
						</View>
					</Card>
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default AnalyticsScreen;

/* ═══════════════════════════════════════════════════════════════════ */
/*  STYLES                                                           */
/* ═══════════════════════════════════════════════════════════════════ */

const styles=StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: colors.background,
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		paddingTop: spacing.sm,
	},

	/* ── SDS Card (matching dashboard) ── */
	heroSds: {
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.md,
	},
	sdsCard: {
		borderRadius: borderRadius.xl,
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.md,
		borderWidth: StyleSheet.hairlineWidth,
		overflow: 'hidden',
	},
	sdsCardTopRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: spacing.sm,
		marginBottom: spacing.xs,
	},
	sdsCardTitle: {
		...textStyles.caption,
		fontWeight: '700',
		textTransform: 'uppercase',
		letterSpacing: 0.8,
		flex: 1,
		minWidth: 0,
		paddingTop: 2,
		paddingRight: spacing.sm,
	},
	sdsMoodBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		flexShrink: 0,
		maxWidth: '56%',
		gap: 4,
		paddingHorizontal: spacing.sm,
		paddingVertical: 4,
		borderRadius: borderRadius.full,
	},
	sdsMoodBadgeText: {
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 0.15,
		flexShrink: 1,
	},
	sdsCardCenter: {
		width: '100%',
		marginBottom: spacing.sm,
	},
	sdsMainRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		gap: spacing.sm,
	},
	sdsBigNumber: {
		fontSize: 32,
		fontWeight: '800',
		letterSpacing: -1.1,
		lineHeight: 36,
		flexShrink: 0,
	},
	sdsTrendSmall: {
		fontSize: 12,
		fontWeight: '800',
		letterSpacing: 0.15,
		textAlign: 'center',
	},
	sdsTrendBlock: {
		flex: 1,
		minWidth: 0,
		alignItems: 'flex-end',
		justifyContent: 'center',
	},
	sdsWeekCompareRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		flexWrap: 'wrap',
		gap: 4,
	},
	sdsWeekDeltaText: {
		fontSize: 14,
		fontWeight: '800',
		letterSpacing: 0.15,
		textAlign: 'right',
	},
	sdsWeekVsText: {
		fontSize: 11,
		fontWeight: '600',
	},
	sdsHalfPieCenterContent: {
		alignItems: 'center'
	},
	/* Half-Pie (semicircle gauge) */
	halfPieWrap: {
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		marginVertical: spacing.xs
	},
	halfPieCenter: {
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		left: 0,
		right: 0,
	},
	/* Donut Chart */
	donutWrap: {
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		marginVertical: spacing.sm,
	},
	donutCenterLabel: {
		...StyleSheet.absoluteFillObject,
		alignItems: 'center',
		justifyContent: 'center',
	},
	donutCenterValue: {
		fontSize: 20,
		fontWeight: '800',
		letterSpacing: -0.5,
		fontVariant: ['tabular-nums'],
	},

	/* ── Metrics Row ── */
	metricsRow: {
		flexDirection: 'row',
		paddingHorizontal: spacing.lg,
		gap: spacing.md,
		marginBottom: spacing.md,
	},
	metricCard: {
		flex: 1,
		backgroundColor: colors.surface,
		borderRadius: borderRadius.xl,
		padding: spacing.md,
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
		...Platform.select({
			ios: {
				shadowColor: colors.ink,
				shadowOffset: {width: 0,height: 4},
				shadowOpacity: 0.06,
				shadowRadius: 16,
			},
			android: {elevation: 3},
			default: {},
		}),
	},
	metricIconWrap: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: spacing.sm,
	},
	metricLabel: {
		...textStyles.caption,
		fontWeight: '700',
		color: colors.textSecondary,
		marginBottom: spacing.xs,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	metricTrendRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		marginTop: spacing.xs,
	},
	metricTrendText: {
		fontSize: 12,
		fontWeight: '700',
	},
	trustLabelRow: {
		marginTop: spacing.xs,
	},
	trustChip: {
		paddingHorizontal: spacing.sm,
		paddingVertical: 3,
		borderRadius: borderRadius.full,
		borderWidth: StyleSheet.hairlineWidth,
	},
	trustChipText: {
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0.3,
	},

	/* ── Aspect Scores ── */
	sectionBlock: {
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.md,
	},
	sectionHeader: {
		marginBottom: spacing.md,
	},
	sectionTitle: {
		...textStyles.headingMedium,
		fontSize: 18,
		fontWeight: '800',
		color: colors.ink,
		letterSpacing: -0.3,
	},
	sectionSubtitle: {
		...textStyles.caption,
		color: colors.textSecondary,
		marginTop: 2,
	},
	aspectsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.md,
	},
	aspectTile: {
		backgroundColor: colors.surface,
		borderRadius: borderRadius.large,
		padding: spacing.md,
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
		...Platform.select({
			ios: {
				shadowColor: colors.ink,
				shadowOffset: {width: 0,height: 2},
				shadowOpacity: 0.04,
				shadowRadius: 8,
			},
			android: {elevation: 1},
			default: {},
		}),
	},
	aspectTileHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		gap: 6,
		marginBottom: spacing.sm,
		justifyContent: 'center',
	},
	aspectTileIconWrap: {
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
	},
	aspectTileName: {
		...textStyles.caption,
		fontWeight: '700',
		color: colors.ink,
		textAlign: 'center',
		flexShrink: 1,
	},
	aspectTileChangeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 3,
		marginTop: spacing.sm,
	},
	aspectTileChangeText: {
		fontSize: 11,
		fontWeight: '700',
	},
	progressBarTrack: {
		width: '100%',
		overflow: 'hidden',
	},
	progressBarFill: {
		height: '100%',
	},

	/* ── Chart Card ── */
	chartCard: {
		marginHorizontal: spacing.lg,
		marginBottom: spacing.sm,
	},
	chartHeaderRow: {
		marginBottom: spacing.sm,
	},
	chartTitle: {
		...textStyles.headingMedium,
		fontSize: 17,
		fontWeight: '800',
		color: colors.ink,
	},
	tabBar: {
		flexDirection: 'row',
		gap: spacing.sm,
		marginBottom: spacing.md,
	},
	tab: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.sm,
		borderRadius: borderRadius.large,
		backgroundColor: colors.surfaceMuted,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	tabActive: {
		backgroundColor: colors.lavenderSoft,
		borderColor: 'rgba(124, 106, 232, 0.45)',
	},
	tabLabel: {
		...textStyles.caption,
		fontSize: 12,
		fontWeight: '800',
		color: colors.textSecondary,
	},
	tabLabelActive: {
		color: colors.primaryDark,
	},

	/* Weekly bars */
	weeklyBarsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		height: 140,
		paddingHorizontal: spacing.xs,
		marginBottom: spacing.md,
	},
	weeklyDayCol: {
		flex: 1,
		alignItems: 'center',
	},
	weeklyBarsGroup: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		height: 120,
		gap: 3,
		marginBottom: spacing.xs,
	},
	weeklyDayLabel: {
		...textStyles.caption,
		fontSize: 11,
		color: colors.textSecondary,
		textAlign: 'center',
	},
	weeklyLegend: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: spacing.lg,
	},

	/* Monthly chart */
	monthlyLegend: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: spacing.md,
		marginTop: spacing.sm,
	},
	legendChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingVertical: 5,
		paddingHorizontal: spacing.sm,
		borderRadius: borderRadius.full,
		backgroundColor: colors.surfaceMuted,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	legendDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	legendChipText: {
		...textStyles.caption,
		fontSize: 11,
		fontWeight: '700',
		color: colors.textPrimary,
	},

	/* ── Strengths & Weaknesses ── */
	insightCard: {
		marginHorizontal: spacing.lg,
		marginBottom: spacing.sm,
	},
	insightHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: spacing.md,
		marginBottom: spacing.md,
	},
	insightIconWrap: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(63, 169, 122, 0.22)',
	},
	insightHeaderText: {
		flex: 1,
		minWidth: 0,
	},
	insightTitle: {
		...textStyles.headingMedium,
		fontSize: 17,
		fontWeight: '800',
		color: colors.ink,
		marginBottom: 4,
	},
	insightSubtitle: {
		...textStyles.caption,
		fontSize: 12,
		color: colors.textSecondary,
		lineHeight: 17,
	},
	swBlock: {
		backgroundColor: colors.mintSoft,
		borderRadius: borderRadius.large,
		padding: spacing.md,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(63, 169, 122, 0.25)',
		marginBottom: spacing.sm,
	},
	swBlockWeak: {
		backgroundColor: colors.peachSoft,
		borderColor: 'rgba(232, 160, 74, 0.3)',
		marginBottom: 0,
	},
	swLabelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.xs,
		marginBottom: spacing.xs,
	},
	swLabel: {
		fontSize: 14,
		fontWeight: '800',
		letterSpacing: -0.2,
	},
	swSummary: {
		...textStyles.bodyMedium,
		fontSize: 13,
		color: colors.textPrimary,
		lineHeight: 19,
		marginBottom: spacing.sm,
	},
	swChips: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.sm,
	},
	swChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		paddingHorizontal: spacing.sm,
		paddingVertical: 5,
		borderRadius: borderRadius.full,
		borderWidth: StyleSheet.hairlineWidth,
	},
	swChipText: {
		fontSize: 12,
		fontWeight: '700',
	},

	/* ── AI Guidance ── */
	guidanceCard: {
		marginHorizontal: spacing.lg,
		marginBottom: spacing.sm,
	},
	guidanceHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: spacing.md,
		marginBottom: spacing.md,
	},
	guidanceIconWrap: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: colors.primaryLight,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(124, 106, 232, 0.22)',
	},
	guidanceHeaderText: {
		flex: 1,
		minWidth: 0,
	},
	guidanceTitle: {
		...textStyles.headingMedium,
		fontSize: 17,
		fontWeight: '800',
		color: colors.ink,
		marginBottom: 4,
	},
	guidanceSubtitle: {
		...textStyles.caption,
		fontSize: 12,
		color: colors.textSecondary,
		lineHeight: 17,
	},
	guidanceItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: spacing.sm,
		padding: spacing.md,
		borderRadius: borderRadius.large,
		borderWidth: StyleSheet.hairlineWidth,
		marginBottom: spacing.sm,
	},
	guidanceItemIcon: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
	},
	guidanceItemText: {
		flex: 1,
		minWidth: 0,
	},
	guidanceItemTitle: {
		...textStyles.bodyLarge,
		fontSize: 14,
		fontWeight: '800',
		color: colors.ink,
		marginBottom: 3,
	},
	guidanceItemMsg: {
		...textStyles.bodyMedium,
		fontSize: 13,
		color: colors.textPrimary,
		lineHeight: 19,
	},

	/* ── Badges ── */
	badgesCard: {
		marginHorizontal: spacing.lg,
		marginBottom: spacing.xl,
	},
	badgesHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: spacing.md,
		marginBottom: spacing.md,
	},
	badgesIconWrap: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: colors.accentLight,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(232, 160, 74, 0.22)',
	},
	badgesHeaderText: {
		flex: 1,
		minWidth: 0,
	},
	badgesTitle: {
		...textStyles.headingMedium,
		fontSize: 17,
		fontWeight: '800',
		color: colors.ink,
		marginBottom: 4,
	},
	badgesSubtitle: {
		...textStyles.caption,
		fontSize: 12,
		color: colors.textSecondary,
		lineHeight: 17,
	},
	badgesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.sm,
	},
	badgeTile: {
		width: '47%',
		backgroundColor: colors.surface,
		borderRadius: borderRadius.large,
		padding: spacing.md,
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.border,
	},
	badgeTileLocked: {
		opacity: 0.5,
	},
	badgeIconCircle: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		marginBottom: spacing.sm,
	},
	badgeLabel: {
		...textStyles.bodyMedium,
		fontSize: 13,
		fontWeight: '800',
		color: colors.ink,
		textAlign: 'center',
		marginBottom: 3,
	},
	badgeLabelLocked: {
		color: colors.textMuted,
	},
	badgeDesc: {
		...textStyles.caption,
		fontSize: 11,
		color: colors.textSecondary,
		textAlign: 'center',
		lineHeight: 15,
	},
	lockedChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		marginTop: spacing.xs,
		paddingHorizontal: spacing.sm,
		paddingVertical: 2,
		borderRadius: borderRadius.full,
		backgroundColor: colors.surfaceMuted,
	},
	lockedChipText: {
		fontSize: 9,
		fontWeight: '700',
		color: colors.textMuted,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
});
