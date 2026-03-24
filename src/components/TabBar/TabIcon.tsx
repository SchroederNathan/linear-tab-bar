import * as Haptics from "expo-haptics";
import { ArrowLeft, type LucideIcon } from "lucide-react-native";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import {
  ICON_SIZE,
  ICON_STROKE_WIDTH,
  PILL_BORDER_RADIUS,
  PILL_HEIGHT,
} from "../../constants/layout";
import { COLORS } from "../../constants/theme";
import { TAB_CENTER_XS } from "../../hooks/usePillGestures";
import NotificationDot from "./NotificationDot";

interface TabIconProps {
  index: number;
  icon: LucideIcon;
  isActive: boolean;
  onPress: (index: number) => void;
  searchProgress: SharedValue<number>;
  showDot: boolean;
  onBackPress: () => void;
  isCircle: boolean;
  pillPressed: SharedValue<number>;
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  glowProgress: SharedValue<number>;
}

export default function TabIcon({
  index,
  icon: Icon,
  isActive,
  onPress,
  searchProgress,
  showDot,
  onBackPress,
  isCircle,
  pillPressed,
  touchX,
  touchY,
  glowProgress,
}: TabIconProps) {
  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePress = useCallback(() => {
    if (index === 0 && onBackPress && searchProgress.get() > 0.5) {
      onBackPress();
    } else {
      onPress(index);
    }
  }, [index, onPress, onBackPress, searchProgress]);

  const tap = Gesture.Tap()
    .onBegin(() => {
      touchX.set(TAB_CENTER_XS[index]);
      touchY.set(PILL_HEIGHT / 2);
      pillPressed.set(withTiming(1, { duration: 80 }));
      cancelAnimation(glowProgress);
      glowProgress.set(1);
    })
    .onFinalize(() => {
      pillPressed.set(withTiming(0, { duration: 150 }));
      glowProgress.set(withTiming(2, { duration: 300 }));
    })
    .onEnd(() => {
      scheduleOnRN(triggerHaptic);
      scheduleOnRN(handlePress);
    });

  // Fade out icons 1-3 during search transition and collapse their width
  const iconAnimatedStyle = useAnimatedStyle(() => {
    const progress = searchProgress.get();
    if (index === 0) {
      return { opacity: 1, transform: [{ scale: 1 }] };
    }
    return {
      opacity: interpolate(progress, [0, 0.3], [1, 0]),
      transform: [{ scale: interpolate(progress, [0, 0.3], [1, 0.5]) }],
      flex: isCircle ? undefined : interpolate(progress, [0, 0.3], [1, 0]),
      width: isCircle
        ? interpolate(progress, [0, 0.3], [CIRCLE_SIZE, 0])
        : undefined,
      overflow: "hidden" as const,
    };
  });

  // Icon 0 crossfade: tab icon ↔ back arrow
  const tabIconOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(searchProgress.get(), [0, 0.5], [1, 0]),
  }));

  const backIconOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(searchProgress.get(), [0.5, 1], [0, 1]),
  }));

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
          <View
            style={[
              styles.activeBackground,
              isCircle && styles.circleBackground,
            ]}
          />
        )}
        <View style={styles.iconWrapper}>
          {index === 0 ? (
            <>
              <Animated.View style={[styles.iconAbsolute, tabIconOpacity]}>
                <Icon
                  size={ICON_SIZE}
                  color={iconColor}
                  strokeWidth={ICON_STROKE_WIDTH}
                />
              </Animated.View>
              <Animated.View style={[styles.iconAbsolute, backIconOpacity]}>
                <ArrowLeft
                  size={ICON_SIZE}
                  color={COLORS.iconActive}
                  strokeWidth={ICON_STROKE_WIDTH}
                />
              </Animated.View>
            </>
          ) : (
            <Icon
              size={ICON_SIZE}
              color={iconColor}
              strokeWidth={ICON_STROKE_WIDTH}
            />
          )}
          {showDot && <NotificationDot searchProgress={searchProgress} />}
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
  iconAbsolute: {
    position: "absolute",
  },
});
