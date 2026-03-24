import { StyleSheet } from "react-native";
import { type GestureType, type ComposedGesture } from "react-native-gesture-handler";
import Animated, {
  type AnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabBarPill from "./TabBarPill";
import SearchButton from "./SearchButton";
import useKeyboardAnimation from "../../hooks/useKeyboardAnimation";
import {
  TAB_BAR_HORIZONTAL_PADDING,
  TAB_BAR_GAP,
  TAB_BAR_BOTTOM_PADDING,
} from "../../constants/layout";

interface TabBarProps {
  activeTab: number;
  onTabPress: (index: number) => void;
  searchProgress: SharedValue<number>;
  isSearchActive: boolean;
  toggleSearch: () => void;
  pillAnimatedStyle: AnimatedStyle;
  searchAnimatedStyle: AnimatedStyle;
  pillPressed: SharedValue<number>;
  overflowX: SharedValue<number>;
  overflowY: SharedValue<number>;
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  glowProgress: SharedValue<number>;
  panGesture: GestureType;
  searchPressed: SharedValue<number>;
  searchOverflowX: SharedValue<number>;
  searchOverflowY: SharedValue<number>;
  searchTouchX: SharedValue<number>;
  searchTouchY: SharedValue<number>;
  searchGlowProgress: SharedValue<number>;
  searchComposedGesture: ComposedGesture;
}

export default function TabBar({
  activeTab,
  onTabPress,
  searchProgress,
  isSearchActive,
  toggleSearch,
  pillAnimatedStyle,
  searchAnimatedStyle,
  pillPressed,
  overflowX,
  overflowY,
  touchX,
  touchY,
  glowProgress,
  panGesture,
  searchPressed,
  searchOverflowX,
  searchOverflowY,
  searchTouchX,
  searchTouchY,
  searchGlowProgress,
  searchComposedGesture,
}: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { keyboardAnimatedStyle } = useKeyboardAnimation();

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_BOTTOM_PADDING) },
        keyboardAnimatedStyle,
      ]}
    >
      <TabBarPill
        activeTab={activeTab}
        onTabPress={onTabPress}
        searchProgress={searchProgress}
        pillAnimatedStyle={pillAnimatedStyle}
        onBackPress={toggleSearch}
        pillPressed={pillPressed}
        overflowX={overflowX}
        overflowY={overflowY}
        touchX={touchX}
        touchY={touchY}
        glowProgress={glowProgress}
        panGesture={panGesture}
      />
      <SearchButton
        searchProgress={searchProgress}
        searchAnimatedStyle={searchAnimatedStyle}
        isSearchActive={isSearchActive}
        pressed={searchPressed}
        overflowX={searchOverflowX}
        overflowY={searchOverflowY}
        touchX={searchTouchX}
        touchY={searchTouchY}
        glowProgress={searchGlowProgress}
        composedGesture={searchComposedGesture}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
    gap: TAB_BAR_GAP,
  },
});
