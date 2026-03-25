import { X } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
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
  ICON_SIZE,
  ICON_STROKE_WIDTH,
  PILL_HEIGHT,
  SEARCH_ACTIVE_HEIGHT,
  SEARCH_ACTIVE_RADIUS,
  SEARCH_BAR_RADIUS,
  TAB_BAR_GAP,
} from "../../constants/layout";
import { COLORS } from "../../constants/theme";
import { liquidGlassTransform } from "../../utils/liquidGlass";
import GlassMaterial from "./GlassMaterial";

const HALF_W = CLOSE_BUTTON_SIZE / 2;
const HALF_H = PILL_HEIGHT / 2;

// Glow constants
const GLOW_SIZE = 120;
const GLOW_HALF = GLOW_SIZE / 2;

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

export default function CloseSearchButton({
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
    liquidGlassTransform(pressed.get(), overflowX.get(), overflowY.get(), HALF_W, HALF_H)
  );

  // Animate the button appearing from the right
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

  return (
    <Animated.View style={visibilityStyle}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={glassStyle}>
          <Animated.View
            style={[
              styles.buttonClip,
              heightStyle,
            ]}
          >
            <GlassMaterial
              borderRadius={SEARCH_BAR_RADIUS}
              style={[styles.container, heightStyle]}
            >
              <View style={styles.iconCenter}>
                <X
                  size={ICON_SIZE}
                  color={COLORS.iconActive}
                  strokeWidth={ICON_STROKE_WIDTH}
                />
              </View>
            </GlassMaterial>
            <Animated.View
              style={[styles.glowContainer, glowStyle]}
              pointerEvents="none"
            >
              <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
                <Defs>
                  <RadialGradient id="closeGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#fff" stopOpacity={1} />
                    <Stop offset="100%" stopColor="#fff" stopOpacity={0} />
                  </RadialGradient>
                </Defs>
                <Rect
                  width={GLOW_SIZE}
                  height={GLOW_SIZE}
                  fill="url(#closeGlow)"
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
  buttonClip: {
    overflow: "hidden",
  },
  container: {
  },
  iconCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  glowContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
  },
});
