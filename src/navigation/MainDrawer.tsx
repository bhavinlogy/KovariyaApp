import React, { useMemo } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabNavigator from './TabNavigator';
import { AppDrawerContent } from '../components/AppDrawerContent';
import { colors } from '../theme';

const Drawer = createDrawerNavigator();

const MainDrawer = () => {
  const screenOptions = useMemo(
    () => ({
      headerShown: false as const,
      drawerType: 'front' as const,
      drawerStyle: {
        width: 300,
        backgroundColor: colors.lavender,
      },
      overlayColor: 'rgba(13, 13, 13, 0.45)',
      sceneContainerStyle: {
        backgroundColor: colors.background,
      },
    }),
    []
  );

  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={screenOptions}
    >
      <Drawer.Screen
        name="Tabs"
        component={TabNavigator}
        options={{
          title: 'Home',
        }}
      />
    </Drawer.Navigator>
  );
};

export default MainDrawer;
