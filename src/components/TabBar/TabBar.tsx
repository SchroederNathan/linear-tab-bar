import { StyleSheet } from "react-native";
import { type GestureType, type ComposedGesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  type AnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import TabBarPill from "./TabBarPill";
import SearchButton from "./SearchButton";
import CloseSearchButton from "./CloseSearchButton";
import {
  TAB_BAR_HORIZONTAL_PADDING,
  TAB_BAR_BOTTOM_PADDING,
} from "../../constants/layout";

interface TabBarProps {
  activeTab: number;
  onTabPress: (index: number) => void;
  searchProgress: SharedValue<number>;
  menuProgress: SharedValue<number>;
  isSearchActive: boolean;
  pillAnimatedStyle: AnimatedStyle;
  searchAnimatedStyle: AnimatedStyle;
  searchButtonMenuStyle: AnimatedStyle;
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
  closePressed: SharedValue<number>;
  closeOverflowX: SharedValue<number>;
  closeOverflowY: SharedValue<number>;
  closeTouchX: SharedValue<number>;
  closeTouchY: SharedValue<number>;
  closeGlowProgress: SharedValue<number>;
  closeComposedGesture: ComposedGesture;
}

export default function TabBar({
  activeTab,
  onTabPress,
  searchProgress,
  menuProgress,
  isSearchActive,
  pillAnimatedStyle,
  searchAnimatedStyle,
  searchButtonMenuStyle,
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
  closePressed,
  closeOverflowX,
  closeOverflowY,
  closeTouchX,
  closeTouchY,
  closeGlowProgress,
  closeComposedGesture,
}: TabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom * 0.7, TAB_BAR_BOTTOM_PADDING);
  const { height } = useReanimatedKeyboardAnimation();

  const keyboardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: height.get() }],
  }));

  return (
      <Animated.View style={[styles.container, { paddingBottom: bottomPadding }, keyboardStyle]}>
        <TabBarPill
          activeTab={activeTab}
          onTabPress={onTabPress}
          searchProgress={searchProgress}
          menuProgress={menuProgress}
          pillAnimatedStyle={pillAnimatedStyle}
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
          searchButtonMenuStyle={searchButtonMenuStyle}
          isSearchActive={isSearchActive}
          pressed={searchPressed}
          overflowX={searchOverflowX}
          overflowY={searchOverflowY}
          touchX={searchTouchX}
          touchY={searchTouchY}
          glowProgress={searchGlowProgress}
          composedGesture={searchComposedGesture}
        />
        <CloseSearchButton
          searchProgress={searchProgress}
          pressed={closePressed}
          overflowX={closeOverflowX}
          overflowY={closeOverflowY}
          touchX={closeTouchX}
          touchY={closeTouchY}
          glowProgress={closeGlowProgress}
          composedGesture={closeComposedGesture}
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
  },
});
