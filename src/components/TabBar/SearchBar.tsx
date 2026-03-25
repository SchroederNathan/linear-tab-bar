import { Search, X } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { GestureDetector, type ComposedGesture } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import {
  CLOSE_BUTTON_SIZE,
  COLORS,
  ICON_SIZE,
  ICON_STROKE_WIDTH,
  PILL_HEIGHT,
  SEARCH_ACTIVE_HEIGHT,
  SEARCH_ACTIVE_RADIUS,
  SEARCH_BAR_RADIUS,
  SEARCH_BUTTON_SIZE,
  TAB_BAR_GAP,
  liquidGlassTransform,
} from "./constants";
import GlassMaterial from "./GlassMaterial";

// --- Shared Glow Overlay ---

interface GlowOverlayProps {
  size: number;
  id: string;
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  glowProgress: SharedValue<number>;
}

export function GlowOverlay({ size, id, touchX, touchY, glowProgress }: GlowOverlayProps) {
  const half = size / 2;

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
        { translateX: touchX.get() - half },
        { translateY: touchY.get() - half },
        { scale },
      ],
    };
  });

  return (
    <Animated.View
      style={[{ position: "absolute", top: 0, left: 0, width: size, height: size }, glowStyle]}
      pointerEvents="none"
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#fff" stopOpacity={1} />
            <Stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

// --- Search Button ---

const SEARCH_HALF_W = SEARCH_BUTTON_SIZE / 2;
const SEARCH_HALF_H = PILL_HEIGHT / 2;

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

export function SearchButton({
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
    liquidGlassTransform(pressed.get(), overflowX.get(), overflowY.get(), SEARCH_HALF_W, SEARCH_HALF_H)
  );

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
    <Animated.View style={searchStyles.searchWrapper}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={glassStyle}>
          <Animated.View style={[searchStyles.searchClip, heightStyle]}>
            <GlassMaterial
              borderRadius={SEARCH_BAR_RADIUS}
              style={[searchStyles.container, heightStyle]}
            >
              <Animated.View style={iconStyle}>
                <Search
                  size={ICON_SIZE}
                  color={COLORS.iconActive}
                  strokeWidth={ICON_STROKE_WIDTH}
                />
              </Animated.View>
              <Animated.View style={[searchStyles.inputContainer, inputOpacity]}>
                <TextInput
                  ref={inputRef}
                  style={searchStyles.input}
                  placeholder="Search Workspace"
                  placeholderTextColor={COLORS.textSecondary}
                  selectionColor={COLORS.accentBlue}
                  returnKeyType="search"
                  pointerEvents={isSearchActive ? "auto" : "none"}
                />
              </Animated.View>
            </GlassMaterial>
            <GlowOverlay
              size={120}
              id="searchGlow"
              touchX={touchX}
              touchY={touchY}
              glowProgress={glowProgress}
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const searchStyles = StyleSheet.create({
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
});

// --- Close Search Button ---

const CLOSE_HALF_W = CLOSE_BUTTON_SIZE / 2;
const CLOSE_HALF_H = PILL_HEIGHT / 2;

interface CloseSearchButtonProps {
  searchProgress: SharedValue<number>;
  pressed: SharedValue<number>;
  overflowX: SharedValue<number>;
  overflowY: SharedValue<number>;
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  glowProgress: SharedValue<number>;
  composedGesture: ComposedGesture;
}

export function CloseSearchButton({
  searchProgress,
  pressed,
  overflowX,
  overflowY,
  touchX,
  touchY,
  glowProgress,
  composedGesture,
}: CloseSearchButtonProps) {
  const closeHeight = useDerivedValue(() =>
    interpolate(searchProgress.get(), [0, 1], [PILL_HEIGHT, SEARCH_ACTIVE_HEIGHT], "clamp")
  );

  const glassStyle = useAnimatedStyle(() =>
    liquidGlassTransform(pressed.get(), overflowX.get(), overflowY.get(), CLOSE_HALF_W, CLOSE_HALF_H)
  );

  const visibilityStyle = useAnimatedStyle(() => {
    const progress = searchProgress.get();
    return {
      opacity: interpolate(progress, [0.3, 0.6], [0, 1], "clamp"),
      width: interpolate(progress, [0, 0.5], [0, SEARCH_ACTIVE_HEIGHT], "clamp"),
      marginLeft: interpolate(progress, [0, 0.5], [0, TAB_BAR_GAP], "clamp"),
      transform: [
        { translateX: interpolate(progress, [0.3, 0.8], [20, 0], "clamp") },
        { scale: interpolate(progress, [0.3, 0.8], [0.5, 1], "clamp") },
      ],
    };
  });

  const heightStyle = useAnimatedStyle(() => {
    const h = closeHeight.get();
    return {
      height: h,
      width: h,
      borderRadius: h / 2,
    };
  });

  return (
    <Animated.View style={visibilityStyle}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={glassStyle}>
          <Animated.View style={[closeStyles.buttonClip, heightStyle]}>
            <GlassMaterial
              borderRadius={SEARCH_BAR_RADIUS}
              style={[closeStyles.container, heightStyle]}
            >
              <View style={closeStyles.iconCenter}>
                <X
                  size={ICON_SIZE}
                  color={COLORS.iconActive}
                  strokeWidth={ICON_STROKE_WIDTH}
                />
              </View>
            </GlassMaterial>
            <GlowOverlay
              size={120}
              id="closeGlow"
              touchX={touchX}
              touchY={touchY}
              glowProgress={glowProgress}
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const closeStyles = StyleSheet.create({
  buttonClip: {
    overflow: "hidden",
  },
  container: {},
  iconCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
