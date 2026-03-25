import * as Haptics from "expo-haptics";
import { type LucideIcon } from "lucide-react-native";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import {
  ICON_SIZE,
  ICON_STROKE_WIDTH,
  PILL_BORDER_RADIUS,
  PILL_HEIGHT,
  PILL_WIDTH,
} from "../../constants/layout";
import { COLORS } from "../../constants/theme";
import { TAB_CENTER_XS } from "../../hooks/usePillGestures";


interface TabIconProps {
  index: number;
  icon: LucideIcon;
  isActive: boolean;
  onPress: (index: number) => void;
  searchProgress: SharedValue<number>;
  menuProgress: SharedValue<number>;
  showDot: boolean;
  isCircle: boolean;
  pillPressed: SharedValue<number>;
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  glowProgress: SharedValue<number>;
  hoveredTab: SharedValue<number>;
}

export default function TabIcon({
  index,
  icon: Icon,
  isActive,
  onPress,
  searchProgress,
  menuProgress,
  showDot,
  isCircle,
  pillPressed,
  touchX,
  touchY,
  glowProgress,
  hoveredTab,
}: TabIconProps) {
  const circlePressed = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePress = useCallback(() => {
    onPress(index);
  }, [index, onPress]);

  const tap = Gesture.Tap()
    .onBegin(() => {
      touchX.set(TAB_CENTER_XS[index]);
      touchY.set(PILL_HEIGHT / 2);
      pillPressed.set(withTiming(1, { duration: 80 }));
      cancelAnimation(glowProgress);
      glowProgress.set(1);
      if (isCircle) {
        cancelAnimation(circlePressed);
        circlePressed.set(1);
      }
    })
    .onFinalize((_event, success) => {
      pillPressed.set(withTiming(0, { duration: 150 }));
      glowProgress.set(withTiming(2, { duration: 300 }));
      if (isCircle) {
        circlePressed.set(withTiming(0, { duration: 200 }));
        // Always trigger for circle since onEnd may not fire due to outer gesture conflict
        scheduleOnRN(triggerHaptic);
        scheduleOnRN(handlePress);
      }
    })
    .onEnd(() => {
      scheduleOnRN(triggerHaptic);
      if (!isCircle) {
        scheduleOnRN(handlePress);
      }
    });

  // Fade out icons during search or menu transition
  const iconAnimatedStyle = useAnimatedStyle(() => {
    const sp = searchProgress.get();
    const mp = menuProgress.get();

    // Menu collapse: all icons collapse toward center and fade
    if (mp > 0.01) {
      const centerX = PILL_WIDTH / 2;
      const iconX = TAB_CENTER_XS[index];
      const toCenter = centerX - iconX;
      return {
        opacity: interpolate(mp, [0.15, 0.5], [1, 0], "clamp"),
        transform: [
          { translateX: interpolate(mp, [0.15, 0.5], [0, toCenter], "clamp") },
          { scale: interpolate(mp, [0.15, 0.5], [1, 0.3], "clamp") },
        ],
      };
    }

    // Search behavior (existing)
    if (index === 0) {
      return { opacity: 1, transform: [{ scale: 1 }] };
    }
    return {
      opacity: interpolate(sp, [0, 0.3], [1, 0]),
      transform: [{ scale: interpolate(sp, [0, 0.3], [1, 0.5]) }],
      flex: isCircle ? undefined : interpolate(sp, [0, 0.3], [1, 0]),
      width: isCircle
        ? interpolate(sp, [0, 0.3], [CIRCLE_SIZE, 0])
        : undefined,
      overflow: "hidden" as const,
    };
  });

  const activeBgStyle = useAnimatedStyle(() => ({
    opacity: hoveredTab.get() === -1 ? 1 : 0,
  }));

  const hoverBgStyle = useAnimatedStyle(() => {
    const hovered = hoveredTab.get() === index ? 1 : 0;
    return {
      opacity: isCircle ? Math.max(circlePressed.get(), hovered) : hovered,
    };
  });

  const iconColor = isActive ? COLORS.iconActive : COLORS.iconDefault;

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          isCircle ? styles.circleContainer : styles.container,
          iconAnimatedStyle,
        ]}
      >
        {isActive && (
          <Animated.View
            style={[
              styles.activeBackground,
              isCircle && styles.circleBackground,
              activeBgStyle,
            ]}
          />
        )}
        <Animated.View
          style={[
            styles.activeBackground,
            isCircle && styles.circleBackground,
            hoverBgStyle,
          ]}
        />
        <View style={styles.iconWrapper}>
          <Icon
            size={ICON_SIZE}
            color={iconColor}
            strokeWidth={ICON_STROKE_WIDTH}
          />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const CIRCLE_SIZE = PILL_HEIGHT - 8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: PILL_BORDER_RADIUS,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: CIRCLE_SIZE / 2,
  },
  activeBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surfaceHover,
    borderRadius: PILL_BORDER_RADIUS,
  },
  circleBackground: {
    borderRadius: CIRCLE_SIZE / 2,
  },
  iconWrapper: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
