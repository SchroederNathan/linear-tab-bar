import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import TabBar from './src/components/TabBar/TabBar';
import PlaceholderScreen from './src/components/Screens/PlaceholderScreen';
import useTabBarAnimation from './src/hooks/useTabBarAnimation';
import { COLORS } from './src/constants/theme';

export default function App() {
  const {
    searchProgress,
    activeTab,
    setActiveTab,
    isSearchActive,
    toggleSearch,
    pillAnimatedStyle,
    searchAnimatedStyle,
  } = useTabBarAnimation();

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <View style={styles.content}>
            <PlaceholderScreen tabIndex={activeTab} />
          </View>
          <TabBar
            activeTab={activeTab}
            onTabPress={setActiveTab}
            searchProgress={searchProgress}
            isSearchActive={isSearchActive}
            toggleSearch={toggleSearch}
            pillAnimatedStyle={pillAnimatedStyle}
            searchAnimatedStyle={searchAnimatedStyle}
          />
          <StatusBar style="light" />
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
});
