import { useCallback, useMemo } from "react";
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

const MENU_DRAG_THRESHOLD = -50; // px upward to trigger menu

export default function usePillGestures(
  activeTab: number,
  setActiveTab: (index: number) => void,
  searchProgress: SharedValue<number>,
  menuProgress: SharedValue<number>,
  toggleMenu: () => void,
) {
  const pillPressed = useSharedValue(0);
  const overflowX = useSharedValue(0);
  const overflowY = useSharedValue(0);
  const touchX = useSharedValue(PILL_WIDTH / 2);
  const touchY = useSharedValue(PILL_HEIGHT / 2);
  const glowProgress = useSharedValue(0);
  const hoveredTab = useSharedValue(-1);
  const menuTriggeredByDrag = useSharedValue(false);

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

  const detectAnyTab = useCallback((x: number) => {
    "worklet";
    if (x >= TABS_START && x < TABS_END) {
      return Math.min(
        MAX_SWITCHABLE_TAB,
        Math.floor((x - TABS_START) / TAB_ZONE_WIDTH),
      );
    }
    if (x >= TABS_END && x <= PILL_WIDTH) {
      return 3;
    }
    return -1;
  }, []);

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

        if (searchProgress.get() < 0.5) {
          hoveredTab.set(detectAnyTab(e.x));
        }
      });

    const pan = Gesture.Pan()
      .minDistance(10)
      .onStart((e) => {
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

        touchX.set(x);
        touchY.set(y);

        let ovX = 0;
        if (x < 0) ovX = x;
        else if (x > PILL_WIDTH) ovX = x - PILL_WIDTH;

        let ovY = 0;
        if (y < 0) ovY = y;
        else if (y > PILL_HEIGHT) ovY = y - PILL_HEIGHT;

        overflowX.set(ovX);
        overflowY.set(ovY);

        if (searchProgress.get() >= 0.5) return;

        // Drag up past threshold → open menu
        if (
          ovY < MENU_DRAG_THRESHOLD &&
          !menuTriggeredByDrag.get() &&
          menuProgress.get() < 0.5
        ) {
          menuTriggeredByDrag.set(true);
          hoveredTab.set(-1);
          scheduleOnRN(toggleMenu);
          scheduleOnRN(triggerHaptic);
          // Spring overflow back immediately
          overflowX.set(withSpring(0, SPRING_BOUNCY));
          overflowY.set(withSpring(0, SPRING_BOUNCY));
          pillPressed.set(withTiming(0, { duration: 150 }));
          return;
        }

        if (menuTriggeredByDrag.get()) return;

        if (ovX === 0 && ovY === 0) {
          const newTab = detectAnyTab(x);
          if (newTab !== hoveredTab.get()) {
            hoveredTab.set(newTab);
            scheduleOnRN(triggerHaptic);
          }
        } else {
          if (hoveredTab.get() !== -1) {
            hoveredTab.set(-1);
          }
        }
      })
      .onEnd(() => {
        const wasDragMenu = menuTriggeredByDrag.get();
        menuTriggeredByDrag.set(false);

        const commitTab = hoveredTab.get();
        hoveredTab.set(-1);
        pillPressed.set(withTiming(0, { duration: 150 }));
        glowProgress.set(withTiming(2, { duration: 300 }));
        overflowX.set(withSpring(0, SPRING_BOUNCY));
        overflowY.set(withSpring(0, SPRING_BOUNCY));

        if (wasDragMenu) return;
        if (searchProgress.get() >= 0.5) return;

        if (commitTab >= 0 && commitTab <= 2) {
          pendingTab.set(commitTab);
          scheduleOnRN(applyPendingTab);
          scheduleOnRN(triggerHaptic);
        } else if (commitTab === 3) {
          scheduleOnRN(toggleMenu);
          scheduleOnRN(triggerHaptic);
        }
      });

    return Gesture.Simultaneous(longPress, pan);
  }, [
    overflowX,
    overflowY,
    touchX,
    touchY,
    pillPressed,
    glowProgress,
    hoveredTab,
    menuTriggeredByDrag,
    detectAnyTab,
    searchProgress,
    menuProgress,
    toggleMenu,
    triggerHaptic,
    pendingTab,
    applyPendingTab,
  ]);

  return {
    pillPressed,
    overflowX,
    overflowY,
    touchX,
    touchY,
    glowProgress,
    hoveredTab,
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
