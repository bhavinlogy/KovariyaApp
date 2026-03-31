import React, { useMemo } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MissionsScreen from '../screens/MissionsScreen';
import MissionDetailScreen from '../screens/MissionDetailScreen';
import { colors } from '../theme';

const Stack = createStackNavigator();

export default function MissionsStack() {
  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.ink,
      headerTitleStyle: { fontWeight: '700' as const },
      headerShadowVisible: false,
      cardStyle: { backgroundColor: colors.background },
    }),
    []
  );

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="MissionsHome"
        component={MissionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MissionDetail"
        component={MissionDetailScreen}
        options={{ title: 'Mission Details' }}
      />
    </Stack.Navigator>
  );
}
