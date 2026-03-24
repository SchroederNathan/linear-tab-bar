import { useCallback, useMemo } from "react";
import {
  useSharedValue,
  withSpring,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import * as Haptics from "expo-haptics";
import { SPRING_BOUNCY } from "../constants/theme";
import { PILL_HEIGHT, SEARCH_BUTTON_SIZE } from "../constants/layout";

export default function useSearchGestures(onToggleSearch: () => void) {
  const pressed = useSharedValue(0);
  const overflowX = useSharedValue(0);
  const overflowY = useSharedValue(0);
  const touchX = useSharedValue(SEARCH_BUTTON_SIZE / 2);
  const touchY = useSharedValue(PILL_HEIGHT / 2);
  const glowProgress = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const tapGesture = useMemo(() => {
    return Gesture.Tap()
      .onBegin(() => {
        touchX.set(SEARCH_BUTTON_SIZE / 2);
        touchY.set(PILL_HEIGHT / 2);
        pressed.set(withTiming(1, { duration: 80 }));
        cancelAnimation(glowProgress);
        glowProgress.set(1);
      })
      .onFinalize(() => {
        pressed.set(withTiming(0, { duration: 150 }));
        glowProgress.set(withTiming(2, { duration: 300 }));
      })
      .onEnd(() => {
        scheduleOnRN(triggerHaptic);
        scheduleOnRN(onToggleSearch);
      });
  }, [pressed, touchX, touchY, glowProgress, triggerHaptic, onToggleSearch]);

  const panGesture = useMemo(() => {
    return Gesture.Pan()
      .minDistance(10)
      .onStart((e) => {
        cancelAnimation(overflowX);
        cancelAnimation(overflowY);
        cancelAnimation(glowProgress);

        touchX.set(e.x);
        touchY.set(e.y);
        pressed.set(withTiming(1, { duration: 80 }));
        glowProgress.set(1);
      })
      .onUpdate((e) => {
        touchX.set(e.x);
        touchY.set(e.y);

        // Use current button width (SEARCH_BUTTON_SIZE when collapsed)
        let ovX = 0;
        if (e.x < 0) ovX = e.x;
        else if (e.x > SEARCH_BUTTON_SIZE) ovX = e.x - SEARCH_BUTTON_SIZE;

        let ovY = 0;
        if (e.y < 0) ovY = e.y;
        else if (e.y > PILL_HEIGHT) ovY = e.y - PILL_HEIGHT;

        overflowX.set(ovX);
        overflowY.set(ovY);
      })
      .onEnd(() => {
        pressed.set(withTiming(0, { duration: 150 }));
        glowProgress.set(withTiming(2, { duration: 300 }));
        overflowX.set(withSpring(0, SPRING_BOUNCY));
        overflowY.set(withSpring(0, SPRING_BOUNCY));
      });
  }, [overflowX, overflowY, touchX, touchY, pressed, glowProgress]);

  const composedGesture = useMemo(
    () => Gesture.Race(panGesture, tapGesture),
    [panGesture, tapGesture],
  );

  return {
    pressed,
    overflowX,
    overflowY,
    touchX,
    touchY,
    glowProgress,
    composedGesture,
  };
}
