import { Search } from "lucide-react-native";
import { useCallback, useRef } from "react";
import { StyleSheet, TextInput } from "react-native";
import { GestureDetector, type ComposedGesture } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  type AnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import {
  ICON_SIZE,
  ICON_STROKE_WIDTH,
  PILL_HEIGHT,
  SEARCH_BAR_RADIUS,
  SEARCH_BUTTON_SIZE,
} from "../../constants/layout";
import { COLORS } from "../../constants/theme";
import GlassMaterial from "./GlassMaterial";

// Stretch constants (same logic as pill)
const MAX_PULL = 60;
const MAX_STRETCH = 0.1;
const MAX_COMPRESS = 0.12;
const HALF_W = SEARCH_BUTTON_SIZE / 2;
const HALF_H = PILL_HEIGHT / 2;

// Glow constants
const GLOW_SIZE = 120;
const GLOW_HALF = GLOW_SIZE / 2;

interface SearchButtonProps {
  searchProgress: SharedValue<number>;
  searchAnimatedStyle: AnimatedStyle;
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
  searchAnimatedStyle,
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

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const blurInput = useCallback(() => {
    inputRef.current?.blur();
  }, []);

  // Auto-focus / blur based on search progress
  useAnimatedReaction(
    () => searchProgress.get(),
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

  const glassStyle = useAnimatedStyle(() => {
    const pressScale = interpolate(pressed.get(), [0, 1], [1, 1.02]);

    const ox = overflowX.get();
    const oy = overflowY.get();

    const signX = ox < 0 ? -1 : 1;
    const dampedX = signX * MAX_PULL * (1 - 1 / (Math.abs(ox) / MAX_PULL + 1));
    const signY = oy < 0 ? -1 : 1;
    const dampedY = signY * MAX_PULL * (1 - 1 / (Math.abs(oy) / MAX_PULL + 1));

    const absDX = Math.abs(dampedX);
    const absDY = Math.abs(dampedY);

    const stretchX = interpolate(absDX, [0, MAX_PULL], [0, MAX_STRETCH], "clamp");
    const stretchY = interpolate(absDY, [0, MAX_PULL], [0, MAX_STRETCH], "clamp");

    const compressX = interpolate(absDY, [0, MAX_PULL], [0, MAX_COMPRESS], "clamp");
    const compressY = interpolate(absDX, [0, MAX_PULL], [0, MAX_COMPRESS], "clamp");

    const scaleX = pressScale * (1 + stretchX) * (1 - compressX);
    const scaleY = pressScale * (1 + stretchY) * (1 - compressY);

    const translateX = signX * HALF_W * stretchX;
    const translateY = signY * HALF_H * stretchY;

    return {
      transform: [
        { translateX },
        { translateY },
        { scaleX },
        { scaleY },
      ],
    };
  });

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

  const inputOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(searchProgress.get(), [0.4, 0.8], [0, 1]),
  }));

  const iconVerticalOffset = (PILL_HEIGHT - ICON_SIZE) / 2;

  const iconStyle = useAnimatedStyle(() => {
    const progress = searchProgress.get();
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
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={glassStyle}>
        <Animated.View
          style={[
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
  glowContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
  },
});
