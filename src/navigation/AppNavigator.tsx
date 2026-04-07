import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { QuizzesScreen } from '../screens';
import MainDrawer from './MainDrawer';
import { MenuPlaceholderScreen } from '../screens/MenuPlaceholderScreen';
import { colors } from '../theme';

const Stack = createStackNavigator();

const AppNavigatorContent = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainDrawer} />
          <Stack.Screen
            name="Sessions"
            component={MenuPlaceholderScreen}
            initialParams={{ title: 'Sessions' }}
          />
          <Stack.Screen
            name="Quizzes"
            component={QuizzesScreen}
          />
          <Stack.Screen
            name="Announcements"
            component={MenuPlaceholderScreen}
            initialParams={{ title: 'Announcements' }}
          />
          <Stack.Screen
            name="Tutorials"
            component={MenuPlaceholderScreen}
            initialParams={{ title: 'Tutorials' }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <AppNavigatorContent />
    </NavigationContainer>
  );
};

export default AppNavigator;
