/**
 * Kovariya - Smart Parenting. Better Children.
 * Parent Mobile App for Student Behaviour Development Platform
 *
 * @format
 */

import React from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';

function App() {
  return (
    <SafeAreaProvider>
      <ExpoStatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
