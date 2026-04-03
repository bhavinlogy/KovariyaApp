import React,{useCallback,useEffect,memo} from 'react';
import {View,Pressable,StyleSheet,Platform} from 'react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated,{
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {LinearGradient} from 'expo-linear-gradient';
import {colors,spacing,borderRadius,shadows,typography} from '../theme';
import {GRADIENT_60_END} from '../theme/layout';

function resolveTabIconOutline(routeName: string): keyof typeof Ionicons.glyphMap {
	switch(routeName) {
		case 'Home': return 'home-outline';
		case 'Missions': return 'flag-outline';
		case 'Goals': return 'trophy-outline';
		case 'Analytics': return 'bar-chart-outline';
		case 'Profile': return 'person-outline';
		default: return 'ellipse-outline';
	}
}

function resolveTabIconFilled(routeName: string): keyof typeof Ionicons.glyphMap {
	switch(routeName) {
		case 'Home': return 'home';
		case 'Missions': return 'flag';
		case 'Goals': return 'trophy';
		case 'Analytics': return 'bar-chart';
		case 'Profile': return 'person';
		default: return 'ellipse';
	}
}

function resolveTabLabel(routeName: string): string {
	switch(routeName) {
		case 'Home': return 'Home';
		case 'Missions': return 'Missions';
		case 'Goals': return 'Goals';
		case 'Analytics': return 'Analytics';
		case 'Profile': return 'Profile';
		default: return routeName;
	}
}

const LABEL_ZOOM_MS=180;
const EASE_OUT=Easing.out(Easing.cubic);
const TAB_SHIFT_PER_STEP=2.25;

const springShift={
	damping: 18,
	stiffness: 220,
	mass: 0.35,
};

export function FloatingTabBar({state,descriptors,navigation}: BottomTabBarProps) {
	const insets=useSafeAreaInsets();
	const activeIndex=state.index;

	return (
		<View
			pointerEvents="box-none"
			style={[styles.wrap,{paddingBottom: Math.max(insets.bottom,spacing.sm)}]}
		>
			<LinearGradient
				colors={[colors.primary,colors.primaryDark]}
				start={{x: 0,y: 0}}
				end={GRADIENT_60_END}
				style={styles.pillShell}
			>
				{/* Decorative orbs — same language as AppGradientHeader */}
				{/*<View style={styles.tabOrbs} pointerEvents="none">
					<View style={styles.tabOrbLarge} />
					<View style={styles.tabOrbMid} />
					<View style={styles.tabOrbTiny} />
				</View>*/}

				{state.routes.map((route,index) => {
					const isFocused=activeIndex===index;
					const {options}=descriptors[route.key];

					const onPress=() => {
						const event=navigation.emit({
							type: 'tabPress',
							target: route.key,
							canPreventDefault: true,
						});
						if(!isFocused&&!event.defaultPrevented) {
							navigation.navigate(route.name);
						}
					};

					const onLongPress=() => {
						navigation.emit({type: 'tabLongPress',target: route.key});
					};

					const tabLabel=
						typeof options.tabBarLabel==='string'
							? options.tabBarLabel
							:resolveTabLabel(route.name);

					return (
						<TabSlot
							key={route.key}
							accessibilityLabel={options.title??route.name}
							activeIndex={activeIndex}
							slotIndex={index}
							isFocused={isFocused}
							routeName={route.name}
							label={tabLabel}
							onPress={onPress}
							onLongPress={onLongPress}
						/>
					);
				})}
			</LinearGradient>
		</View>
	);
}

type TabSlotProps={
	activeIndex: number;
	slotIndex: number;
	isFocused: boolean;
	routeName: string;
	label: string;
	onPress: () => void;
	onLongPress: () => void;
	accessibilityLabel?: string;
};

const TabSlot=memo(function TabSlot({
	activeIndex,
	slotIndex,
	isFocused,
	routeName,
	label,
	onPress,
	onLongPress,
	accessibilityLabel,
}: TabSlotProps) {
	const labelScale=useSharedValue(1);
	const labelOpacity=useSharedValue(isFocused? 1:0);
	const capsuleWidth=useSharedValue(isFocused? 1:0);
	const shiftX=useSharedValue((slotIndex-activeIndex)*TAB_SHIFT_PER_STEP);

	// Animate on focus change
	useEffect(() => {
		if(isFocused) {
			// Label zoom-in bounce
			labelScale.value=1.15;
			labelScale.value=withTiming(1,{duration: LABEL_ZOOM_MS,easing: EASE_OUT});
			// Label fade in with slight delay
			labelOpacity.value=withTiming(1,{duration: 200,easing: EASE_OUT});
			// Capsule expand
			capsuleWidth.value=withSpring(1,{damping: 16,stiffness: 180});
		} else {
			labelOpacity.value=withTiming(0,{duration: 120});
			capsuleWidth.value=withTiming(0,{duration: 180});
			labelScale.value=1;
		}
	},[isFocused]);

	// Horizontal nudge for inactive tabs
	useEffect(() => {
		const target=(slotIndex-activeIndex)*TAB_SHIFT_PER_STEP;
		shiftX.value=withSpring(target,springShift);
	},[activeIndex,slotIndex]);

	const labelAnimStyle=useAnimatedStyle(() => ({
		transform: [{scale: labelScale.value}],
		opacity: labelOpacity.value,
		// Collapse label width when inactive so capsule shrinks
		maxWidth: labelOpacity.value===0? 0:80,
		overflow: 'hidden',
	}));

	const slotShiftStyle=useAnimatedStyle(() => ({
		transform: [{translateX: shiftX.value}],
	}));

	const handlePress=useCallback(() => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onPress();
	},[onPress]);

	const outlineName=resolveTabIconOutline(routeName);
	const filledName=resolveTabIconFilled(routeName);

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{selected: isFocused}}
			accessibilityLabel={accessibilityLabel}
			onPress={handlePress}
			onLongPress={onLongPress}
			// ✅ KEY FIX: active slot grows to fill space; inactive stays icon-sized
			style={isFocused? styles.slotActive:styles.slotInactive}
			hitSlop={{top: 4,bottom: 4,left: 2,right: 2}}
		>
			<Animated.View style={[styles.slotContent,slotShiftStyle]}>
				{isFocused? (
					// Active: white capsule with icon + animated label
					<View style={[styles.activeCapsule,styles.capsuleShadow]}>
						<View style={styles.iconStable}>
							<Ionicons name={filledName} size={20} color={colors.primaryDark} />
						</View>
						<Animated.Text
							style={[styles.tabLabelActive,labelAnimStyle]}
							numberOfLines={1}
						>
							{label}
						</Animated.Text>
					</View>
				):(
					// Inactive: bare icon, fixed 44×44 touch target
					<View style={styles.inactiveHit}>
						<Ionicons name={outlineName} size={23} color="rgba(255, 255, 255, 0.65)" />
					</View>
				)}
			</Animated.View>
		</Pressable>
	);
});

const styles=StyleSheet.create({
	wrap: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: 'center',
		paddingHorizontal: 18,
	},

	pillShell: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		maxWidth: 420,
		borderRadius: borderRadius.xxl,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(255, 255, 255, 0.15)',
		paddingHorizontal: 15,
		paddingVertical: 8,
		overflow: 'hidden',
		gap: 10,
		...shadows.large,
		...Platform.select({
			android: {marginBottom: spacing.xs},
			default: {},
		}),
	},

	/* Orbs — matching AppGradientHeader visual language, scaled for tab bar */
	tabOrbs: {
		...StyleSheet.absoluteFillObject,
	},
	tabOrbLarge: {
		position: 'absolute',
		width: 140,
		height: 140,
		borderRadius: 70,
		backgroundColor: 'rgba(255, 255, 255, 0.09)',
		top: -60,
		right: -30,
	},
	tabOrbMid: {
		position: 'absolute',
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: 'rgba(232, 228, 255, 0.14)',
		bottom: -10,
		left: 25,
	},
	tabOrbTiny: {
		position: 'absolute',
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: 'rgba(255, 255, 255, 0.10)',
		top: 6,
		left: '45%',
	},

	// ✅ Active slot: flex: 1 so it expands and pushes inactive tabs inward
	slotActive: {
		flex: 1,
		minHeight: 44,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 2
	},

	// ✅ Inactive slot: flex: 0, fixed 44px width — never grows
	slotInactive: {
		flex: 0,
		width: 44,
		minHeight: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},

	slotContent: {
		alignItems: 'center',
		justifyContent: 'center',
	},

	inactiveHit: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},

	iconStable: {
		width: 24,
		height: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},

	activeCapsule: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 7,
		paddingVertical: 9,
		paddingLeft: 12,
		paddingRight: 12,
		borderRadius: borderRadius.full,
		backgroundColor: colors.tabBarActivePill,
	},

	capsuleShadow: {
		...Platform.select({
			ios: {
				shadowColor: '#000000',
				shadowOffset: {width: 0,height: 2},
				shadowOpacity: 0.12,
				shadowRadius: 8,
			},
			android: {elevation: 5},
			default: {},
		}),
	},

	tabLabelActive: {
		fontFamily: typography.fontFamily.primary,
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0.12,
		color: colors.primaryDark,
		paddingRight: 4,
	},
});
