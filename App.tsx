import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import TabBar from "./src/components/TabBar/TabBar";
import PlaceholderScreen from "./src/components/Screens/PlaceholderScreen";
import useTabBarAnimation from "./src/hooks/useTabBarAnimation";
import usePillGestures from "./src/hooks/usePillGestures";
import useSearchGestures from "./src/hooks/useSearchGestures";
import { COLORS } from "./src/constants/theme";

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

  const {
    pillPressed,
    overflowX,
    overflowY,
    touchX,
    touchY,
    glowProgress,
    panGesture,
  } = usePillGestures(
    activeTab,
    setActiveTab,
    searchProgress,
  );

  const {
    pressed: searchPressed,
    overflowX: searchOverflowX,
    overflowY: searchOverflowY,
    touchX: searchTouchX,
    touchY: searchTouchY,
    glowProgress: searchGlowProgress,
    composedGesture: searchComposedGesture,
  } = useSearchGestures(toggleSearch);

  const {
    pressed: closePressed,
    overflowX: closeOverflowX,
    overflowY: closeOverflowY,
    touchX: closeTouchX,
    touchY: closeTouchY,
    glowProgress: closeGlowProgress,
    composedGesture: closeComposedGesture,
  } = useSearchGestures(toggleSearch);

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
            pillAnimatedStyle={pillAnimatedStyle}
            searchAnimatedStyle={searchAnimatedStyle}
            pillPressed={pillPressed}
            overflowX={overflowX}
            overflowY={overflowY}
            touchX={touchX}
            touchY={touchY}
            glowProgress={glowProgress}
            panGesture={panGesture}
            searchPressed={searchPressed}
            searchOverflowX={searchOverflowX}
            searchOverflowY={searchOverflowY}
            searchTouchX={searchTouchX}
            searchTouchY={searchTouchY}
            searchGlowProgress={searchGlowProgress}
            searchComposedGesture={searchComposedGesture}
            closePressed={closePressed}
            closeOverflowX={closeOverflowX}
            closeOverflowY={closeOverflowY}
            closeTouchX={closeTouchX}
            closeTouchY={closeTouchY}
            closeGlowProgress={closeGlowProgress}
            closeComposedGesture={closeComposedGesture}
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
