import { Search } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { StyleSheet, TextInput } from "react-native";
import { GestureDetector, type ComposedGesture } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import {
  ICON_SIZE,
  ICON_STROKE_WIDTH,
  PILL_HEIGHT,
  SEARCH_ACTIVE_HEIGHT,
  SEARCH_ACTIVE_RADIUS,
  SEARCH_BAR_RADIUS,
  SEARCH_BUTTON_SIZE,
} from "../../constants/layout";
import { COLORS } from "../../constants/theme";
import { liquidGlassTransform } from "../../utils/liquidGlass";
import GlassMaterial from "./GlassMaterial";

const HALF_W = SEARCH_BUTTON_SIZE / 2;
const HALF_H = PILL_HEIGHT / 2;

// Glow constants
const GLOW_SIZE = 120;
const GLOW_HALF = GLOW_SIZE / 2;

interface SearchButtonProps {
  searchProgress: SharedValue<number>;
  isSearchActive: boolean;
  pressed: SharedValue<number>;
  overflowX: SharedValue<number>;
  overflowY: SharedValue<number>;
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  glowProgress: SharedValue<number>;
  composedGesture: ComposedGesture;
}

export default function SearchButton({
  searchProgress,
  isSearchActive,
  pressed,
  overflowX,
  overflowY,
  touchX,
  touchY,
  glowProgress,
  composedGesture,
}: SearchButtonProps) {
  const inputRef = useRef<TextInput>(null);


  // Focus immediately when search opens so keyboard animates in sync
  useEffect(() => {
    if (isSearchActive) {
      inputRef.current?.focus();
    }
  }, [isSearchActive]);

  const searchHeight = useDerivedValue(() =>
    interpolate(searchProgress.get(), [0, 1], [PILL_HEIGHT, SEARCH_ACTIVE_HEIGHT], "clamp")
  );
  const searchRadius = useDerivedValue(() =>
    interpolate(searchProgress.get(), [0, 1], [SEARCH_BAR_RADIUS, SEARCH_ACTIVE_RADIUS], "clamp")
  );

  const glassStyle = useAnimatedStyle(() =>
    liquidGlassTransform(pressed.get(), overflowX.get(), overflowY.get(), HALF_W, HALF_H)
  );

  const glowStyle = useAnimatedStyle(() => {
    const progress = glowProgress.get();
    const opacity = progress <= 1
      ? progress * 0.2
      : interpolate(progress, [1, 2], [0.2, 0], "clamp");
    const scale = progress <= 1
      ? 1
      : interpolate(progress, [1, 2], [1, 4], "clamp");

    return {
      opacity,
      transform: [
        { translateX: touchX.get() - GLOW_HALF },
        { translateY: touchY.get() - GLOW_HALF },
        { scale },
      ],
    };
  });

  const heightStyle = useAnimatedStyle(() => ({
    height: searchHeight.get(),
    borderRadius: searchRadius.get(),
  }));

  const inputOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(searchProgress.get(), [0.4, 0.8], [0, 1]),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    top: (searchHeight.get() - ICON_SIZE) / 2,
    left: interpolate(
      searchProgress.get(),
      [0, 1],
      [(SEARCH_BUTTON_SIZE - ICON_SIZE) / 2, 16],
    ),
  }));

  return (
    <Animated.View style={styles.searchWrapper}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={glassStyle}>
          <Animated.View
            style={[
              styles.searchClip,
              heightStyle,
            ]}
          >
          <GlassMaterial
            borderRadius={SEARCH_BAR_RADIUS}
            style={[styles.container, heightStyle]}
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
                placeholder="Search Workspace"
                placeholderTextColor={COLORS.textSecondary}
                selectionColor={COLORS.accentBlue}
                returnKeyType="search"
                pointerEvents={isSearchActive ? "auto" : "none"}
              />
            </Animated.View>
          </GlassMaterial>
          <Animated.View
            style={[styles.glowContainer, glowStyle]}
            pointerEvents="none"
          >
            <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
              <Defs>
                <RadialGradient id="searchGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#fff" stopOpacity={1} />
                  <Stop offset="100%" stopColor="#fff" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect
                width={GLOW_SIZE}
                height={GLOW_SIZE}
                fill="url(#searchGlow)"
              />
            </Svg>
          </Animated.View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  searchClip: {
    overflow: "hidden",
  },
  container: {
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
  searchWrapper: {
    flex: 1,
  },
  glowContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
  },
});
