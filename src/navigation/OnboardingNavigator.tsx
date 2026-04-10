import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { Easing } from 'react-native-reanimated';
import { OnboardingScreen1 } from '../screens/onboarding/OnboardingScreen1';
import { OnboardingScreen2 } from '../screens/onboarding/OnboardingScreen2';
import { OnboardingScreen3 } from '../screens/onboarding/OnboardingScreen3';
import { OnboardingScreen4 } from '../screens/onboarding/OnboardingScreen4';

const Stack = createStackNavigator();

// Fluid, Material-motion style transition: current slides out left,
// next slides in from right with a slight scale & fade.
const forSlide = ({ current, next, layouts }: any) => {
  const translateX = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.width, 0],
  });
  const nextTranslate = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -layouts.screen.width * 0.3],
      })
    : undefined;
  const opacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  return {
    cardStyle: {
      transform: [
        { translateX: nextTranslate ? nextTranslate : { __getValue: () => 0 } as any },
        { translateX },
      ],
      opacity,
    },
  };
};

export const OnboardingNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      transitionSpec: {
        open: {
          animation: 'spring',
          config: { stiffness: 280, damping: 30, mass: 1 },
        },
        close: {
          animation: 'spring',
          config: { stiffness: 280, damping: 30, mass: 1 },
        },
      },
    }}
  >
    <Stack.Screen name="Onboarding1" component={OnboardingScreen1} options={{ gestureEnabled: false }} />
    <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
    <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />
    <Stack.Screen name="Onboarding4" component={OnboardingScreen4} />
  </Stack.Navigator>
);
