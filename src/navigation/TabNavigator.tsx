import React, { useMemo } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { colors } from '../theme';
import { FloatingTabBar } from './FloatingTabBar';

import DashboardScreen from '../screens/DashboardScreen';
import RatingScreen from '../screens/RatingScreen';
import GoalsScreen from '../screens/GoalsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const stylesTitle = StyleSheet.create({
  headerTitle: {
    fontWeight: '600',
    fontSize: 18,
    color: colors.ink,
  },
});

const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: colors.background,
    shadowColor: 'transparent',
    elevation: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});

const staticTabOptions: Pick<
  BottomTabNavigationOptions,
  'headerStyle' | 'headerTintColor' | 'headerTitleStyle' | 'tabBarShowLabel'
> = {
  headerStyle: headerStyles.header,
  headerTintColor: colors.ink,
  headerTitleStyle: stylesTitle.headerTitle,
  tabBarShowLabel: false,
};

const TabNavigator = () => {
  const screenOptions = useMemo(
    (): BottomTabNavigationOptions => ({
      ...staticTabOptions,
      tabBarStyle: {
        position: 'absolute',
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
        height: 0,
      },
    }),
    []
  );

  const renderTabBar = useMemo(
    () => (props: BottomTabBarProps) => <FloatingTabBar {...props} />,
    []
  );

  return (
    <Tab.Navigator screenOptions={screenOptions} tabBar={renderTabBar}>
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          title: 'Kovariya',
          headerTitle: 'Home',
        }}
      />
      <Tab.Screen
        name="Rating"
        component={RatingScreen}
        options={{
          title: 'Rating',
          headerTitle: 'Rate behaviour',
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          title: 'Goals',
          headerTitle: 'Goals & missions',
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'Analytics',
          headerTitle: 'Insights',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'You',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
