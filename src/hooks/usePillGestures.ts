import { useCallback, useEffect, useMemo } from "react";
import {
  useSharedValue,
  withSpring,
  withTiming,
  cancelAnimation,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import * as Haptics from "expo-haptics";
import { SPRING_BOUNCY } from "../constants/theme";
import { ICON_PADDING, PILL_HEIGHT, PILL_WIDTH } from "../constants/layout";

const MAX_SWITCHABLE_TAB = 2;
const CIRCLE_SIZE = PILL_HEIGHT - 8;

// Tab zone boundaries: 3 flex tabs then a fixed-width circle tab
const TABS_START = ICON_PADDING;
const TABS_END = PILL_WIDTH - ICON_PADDING - CIRCLE_SIZE;
const TAB_ZONE_WIDTH = (TABS_END - TABS_START) / 3;

export default function usePillGestures(
  activeTab: number,
  setActiveTab: (index: number) => void,
  searchProgress: SharedValue<number>,
) {
  const pillPressed = useSharedValue(0);
  const overflowX = useSharedValue(0);
  const overflowY = useSharedValue(0);
  const touchX = useSharedValue(PILL_WIDTH / 2);
  const touchY = useSharedValue(PILL_HEIGHT / 2);
  const glowProgress = useSharedValue(0);
  const activeTabSV = useSharedValue(activeTab);

  useEffect(() => {
    activeTabSV.set(activeTab);
  }, [activeTab]);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const pendingTab = useSharedValue(-1);

  const applyPendingTab = useCallback(() => {
    const tab = pendingTab.get();
    if (tab >= 0) {
      setActiveTab(tab);
      pendingTab.set(-1);
    }
  }, [setActiveTab, pendingTab]);

  const detectTab = useCallback((x: number) => {
    "worklet";
    if (x >= TABS_START && x < TABS_END) {
      return Math.min(
        MAX_SWITCHABLE_TAB,
        Math.floor((x - TABS_START) / TAB_ZONE_WIDTH),
      );
    }
    return -1;
  }, []);

  const switchToTab = useCallback((x: number) => {
    "worklet";
    if (searchProgress.get() >= 0.5) return;
    const newTab = detectTab(x);
    if (newTab >= 0 && newTab !== activeTabSV.get()) {
      activeTabSV.set(newTab);
      pendingTab.set(newTab);
      scheduleOnRN(applyPendingTab);
      scheduleOnRN(triggerHaptic);
    }
  }, [searchProgress, detectTab, activeTabSV, pendingTab, applyPendingTab, triggerHaptic]);

  const panGesture = useMemo(() => {
    const longPress = Gesture.LongPress()
      .minDuration(0)
      .onStart((e) => {
        cancelAnimation(overflowX);
        cancelAnimation(overflowY);
        cancelAnimation(glowProgress);

        touchX.set(e.x);
        touchY.set(e.y);
        pillPressed.set(withTiming(1, { duration: 80 }));
        glowProgress.set(1);

        // Activate tab immediately on press
        switchToTab(e.x);
      });

    const pan = Gesture.Pan()
      .minDistance(10)
      .onStart((e) => {
        // Ensure glow is active even on fast swipes where long press may not fire
        cancelAnimation(overflowX);
        cancelAnimation(overflowY);
        cancelAnimation(glowProgress);

        touchX.set(e.x);
        touchY.set(e.y);
        pillPressed.set(withTiming(1, { duration: 80 }));
        glowProgress.set(1);
      })
      .onUpdate((e) => {
        const x = e.x;
        const y = e.y;

        // Track finger for glow position
        touchX.set(x);
        touchY.set(y);

        // Compute overflow past container bounds
        let ovX = 0;
        if (x < 0) ovX = x;
        else if (x > PILL_WIDTH) ovX = x - PILL_WIDTH;

        let ovY = 0;
        if (y < 0) ovY = y;
        else if (y > PILL_HEIGHT) ovY = y - PILL_HEIGHT;

        overflowX.set(ovX);
        overflowY.set(ovY);

        // When inside bounds, update active tab based on finger position
        if (ovX === 0 && ovY === 0) {
          switchToTab(x);
        }
      })
      .onEnd(() => {
        pillPressed.set(withTiming(0, { duration: 150 }));
        glowProgress.set(withTiming(2, { duration: 300 }));
        overflowX.set(withSpring(0, SPRING_BOUNCY));
        overflowY.set(withSpring(0, SPRING_BOUNCY));
      });

    return Gesture.Simultaneous(longPress, pan);
  }, [
    overflowX,
    overflowY,
    touchX,
    touchY,
    pillPressed,
    glowProgress,
    switchToTab,
  ]);

  return {
    pillPressed,
    overflowX,
    overflowY,
    touchX,
    touchY,
    glowProgress,
    panGesture,
  };
}

// Precomputed tab center X positions — safe to use on UI thread (plain numbers)
export const TAB_CENTER_XS = [
  TABS_START + TAB_ZONE_WIDTH * 0.5,
  TABS_START + TAB_ZONE_WIDTH * 1.5,
  TABS_START + TAB_ZONE_WIDTH * 2.5,
  PILL_WIDTH - ICON_PADDING - CIRCLE_SIZE / 2,
] as const;
