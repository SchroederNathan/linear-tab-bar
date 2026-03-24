import * as Haptics from "expo-haptics";
import { Search } from "lucide-react-native";
import { useCallback, useRef } from "react";
import { StyleSheet, TextInput } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type AnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import {
  ICON_SIZE,
  ICON_STROKE_WIDTH,
  PILL_HEIGHT,
  SEARCH_BAR_RADIUS,
  SEARCH_BUTTON_SIZE,
} from "../../constants/layout";
import { COLORS } from "../../constants/theme";
import GlassMaterial from "./GlassMaterial";

interface SearchButtonProps {
  searchProgress: SharedValue<number>;
  searchAnimatedStyle: AnimatedStyle;
  onToggleSearch: () => void;
  isSearchActive: boolean;
}

export default function SearchButton({
  searchProgress,
  searchAnimatedStyle,
  onToggleSearch,
  isSearchActive,
}: SearchButtonProps) {
  const inputRef = useRef<TextInput>(null);
  const pressed = useSharedValue(0);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const blurInput = useCallback(() => {
    inputRef.current?.blur();
  }, []);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Auto-focus / blur based on search progress
  useAnimatedReaction(
    () => searchProgress.value,
    (current, previous) => {
      if (previous !== null) {
        if (current > 0.95 && previous <= 0.95) {
          scheduleOnRN(focusInput);
        }
        if (current < 0.5 && previous >= 0.5) {
          scheduleOnRN(blurInput);
        }
      }
    },
  );

  const tap = Gesture.Tap()
    .onBegin(() => {
      pressed.value = withTiming(1, { duration: 80 });
    })
    .onFinalize(() => {
      pressed.value = withTiming(0, { duration: 150 });
    })
    .onEnd(() => {
      scheduleOnRN(triggerHaptic);
      scheduleOnRN(onToggleSearch);
    });

  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.95]) }],
  }));

  const inputOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(searchProgress.value, [0.4, 0.8], [0, 1]),
  }));

  const iconVerticalOffset = (PILL_HEIGHT - ICON_SIZE) / 2;

  const iconStyle = useAnimatedStyle(() => {
    const progress = searchProgress.value;
    return {
      position: "absolute" as const,
      top: iconVerticalOffset,
      left: interpolate(
        progress,
        [0, 1],
        [(SEARCH_BUTTON_SIZE - ICON_SIZE) / 2, 16],
      ),
    };
  });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          pressAnimatedStyle,
          searchAnimatedStyle,
          styles.searchClip,
          { borderRadius: SEARCH_BAR_RADIUS },
        ]}
      >
        <GlassMaterial
          borderRadius={SEARCH_BAR_RADIUS}
          style={styles.container}
        >
          <Animated.View style={iconStyle}>
            <Search
              size={ICON_SIZE}
              color={COLORS.iconActive}
              strokeWidth={ICON_STROKE_WIDTH}
            />
          </Animated.View>
          <Animated.View style={[styles.inputContainer, inputOpacity]}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Search..."
              placeholderTextColor={COLORS.textSecondary}
              selectionColor={COLORS.accentBlue}
              returnKeyType="search"
              pointerEvents={isSearchActive ? "auto" : "none"}
            />
          </Animated.View>
        </GlassMaterial>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  searchClip: {
    overflow: "hidden",
  },
  container: {
    height: PILL_HEIGHT,
    justifyContent: "center",
  },
  inputContainer: {
    marginLeft: 44,
    marginRight: 16,
    flex: 1,
  },
  input: {
    color: COLORS.textPrimary,
    fontSize: 16,
    height: "100%",
  },
});
