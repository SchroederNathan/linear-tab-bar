import { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard, Pressable, StyleSheet } from "react-native";
import { Gesture, type ComposedGesture } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import { scheduleOnRN } from "react-native-worklets";
import * as Haptics from "expo-haptics";
import {
  MENU_BORDER_RADIUS,
  MENU_DRAG_THRESHOLD,
  MENU_HEIGHT,
  MAX_SWITCHABLE_TAB,
  PILL_BORDER_RADIUS,
  PILL_HEIGHT,
  PILL_WIDTH,
  SEARCH_BUTTON_SIZE,
  SPRING,
  SPRING_BOUNCY,
  SPRING_MENU_CLOSE,
  SPRING_MENU_OPEN,
  TAB_BAR_BOTTOM_PADDING,
  TAB_BAR_GAP,
  TAB_BAR_HORIZONTAL_PADDING,
  TAB_ZONE_WIDTH,
  TABS_END,
  TABS_START,
} from "./constants";
import TabBarPill from "./TabBarPill";
import { SearchButton, CloseSearchButton } from "./SearchBar";

// --- useTabBarAnimation ---

function useTabBarAnimation() {
  const searchProgress = useSharedValue(0);
  const menuProgress = useSharedValue(0);
  const [activeTab, setActiveTab] = useState(0);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleSearch = useCallback(() => {
    if (menuProgress.get() > 0.5) return;
    const opening = searchProgress.get() < 0.5;
    if (!opening) {
      Keyboard.dismiss();
    }
    searchProgress.set(withSpring(opening ? 1 : 0, SPRING));
    setIsSearchActive(opening);
  }, [searchProgress, menuProgress]);

  const toggleMenu = useCallback(() => {
    if (searchProgress.get() > 0.5) return;
    const opening = menuProgress.get() < 0.5;
    cancelAnimation(menuProgress);
    menuProgress.set(withSpring(
      opening ? 1 : 0,
      opening ? SPRING_MENU_OPEN : SPRING_MENU_CLOSE,
    ));
    setIsMenuOpen(opening);
  }, [menuProgress, searchProgress]);

  const pillAnimatedStyle = useAnimatedStyle(() => {
    const sp = searchProgress.get();
    const mp = menuProgress.get();

    const isMenu = mp > 0.01;

    if (isMenu) {
      const scaleX = interpolate(mp, [0, 0.15, 0.5, 0.85], [1, 0.7, 0.85, 1], 'clamp');
      const height = interpolate(mp, [0, 0.1, 1], [PILL_HEIGHT, PILL_HEIGHT, MENU_HEIGHT]);
      const borderRadius = interpolate(mp, [0, 0.8], [PILL_BORDER_RADIUS, MENU_BORDER_RADIUS], 'clamp');

      return {
        width: PILL_WIDTH,
        height,
        opacity: 1,
        marginRight: TAB_BAR_GAP,
        borderRadius,
        transform: [{ scaleX }],
      };
    }

    return {
      width: interpolate(sp, [0, 0.6], [PILL_WIDTH, 0], 'clamp'),
      height: PILL_HEIGHT,
      opacity: interpolate(sp, [0, 0.3], [1, 0], 'clamp'),
      marginRight: interpolate(sp, [0, 0.6], [TAB_BAR_GAP, 0], 'clamp'),
      borderRadius: PILL_BORDER_RADIUS,
      transform: [
        { translateX: interpolate(sp, [0, 0.6], [0, -PILL_WIDTH * 0.3], 'clamp') },
      ],
    };
  });

  return {
    searchProgress,
    menuProgress,
    activeTab,
    setActiveTab,
    isSearchActive,
    isMenuOpen,
    toggleSearch,
    toggleMenu,
    pillAnimatedStyle,
  };
}

// --- usePillGestures ---

function usePillGestures(
  activeTab: number,
  setActiveTab: (index: number) => void,
  searchProgress: ReturnType<typeof useSharedValue<number>>,
  menuProgress: ReturnType<typeof useSharedValue<number>>,
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

        if (
          ovY < MENU_DRAG_THRESHOLD &&
          !menuTriggeredByDrag.get() &&
          menuProgress.get() < 0.5
        ) {
          menuTriggeredByDrag.set(true);
          hoveredTab.set(-1);
          scheduleOnRN(toggleMenu);
          scheduleOnRN(triggerHaptic);
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
        pillPressed.set(withTiming(0, { duration: 150 }));
        glowProgress.set(withTiming(2, { duration: 300 }));
        overflowX.set(withSpring(0, SPRING_BOUNCY));
        overflowY.set(withSpring(0, SPRING_BOUNCY));

        if (wasDragMenu) {
          hoveredTab.set(-1);
          return;
        }
        if (searchProgress.get() >= 0.5) {
          hoveredTab.set(-1);
          return;
        }

        if (commitTab >= 0 && commitTab <= 2) {
          pendingTab.set(commitTab);
          scheduleOnRN(applyPendingTab);
          scheduleOnRN(triggerHaptic);
        } else {
          hoveredTab.set(-1);
          if (commitTab === 3) {
            scheduleOnRN(toggleMenu);
            scheduleOnRN(triggerHaptic);
          }
        }
      });

    return Gesture.Simultaneous(longPress, pan);
  }, [
    overflowX, overflowY, touchX, touchY, pillPressed, glowProgress,
    hoveredTab, menuTriggeredByDrag, detectAnyTab, searchProgress,
    menuProgress, toggleMenu, triggerHaptic, pendingTab, applyPendingTab,
  ]);

  return {
    pillPressed, overflowX, overflowY, touchX, touchY,
    glowProgress, hoveredTab, panGesture,
  };
}

// --- useSearchGestures ---

function useSearchGestures(onToggleSearch: () => void) {
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

  const composedGesture: ComposedGesture = useMemo(
    () => Gesture.Race(panGesture, tapGesture),
    [panGesture, tapGesture],
  );

  return {
    pressed, overflowX, overflowY, touchX, touchY,
    glowProgress, composedGesture,
  };
}

// --- TabBar Component ---

interface TabBarProps {
  onTabChange?: (index: number) => void;
}

export default function TabBar({ onTabChange }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom * 0.7, TAB_BAR_BOTTOM_PADDING);
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();

  const {
    searchProgress, menuProgress, activeTab, setActiveTab,
    isSearchActive, isMenuOpen, toggleSearch, toggleMenu, pillAnimatedStyle,
  } = useTabBarAnimation();

  const handleTabPress = useCallback((index: number) => {
    if (index === 3) {
      toggleMenu();
    } else {
      setActiveTab(index);
    }
  }, [toggleMenu, setActiveTab]);

  const {
    pillPressed, overflowX, overflowY, touchX, touchY,
    glowProgress, hoveredTab, panGesture,
  } = usePillGestures(activeTab, setActiveTab, searchProgress, menuProgress, toggleMenu);

  useEffect(() => {
    hoveredTab.set(-1);
  }, [activeTab, hoveredTab]);

  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);

  const {
    pressed: searchPressed, overflowX: searchOverflowX, overflowY: searchOverflowY,
    touchX: searchTouchX, touchY: searchTouchY, glowProgress: searchGlowProgress,
    composedGesture: searchComposedGesture,
  } = useSearchGestures(toggleSearch);

  const {
    pressed: closePressed, overflowX: closeOverflowX, overflowY: closeOverflowY,
    touchX: closeTouchX, touchY: closeTouchY, glowProgress: closeGlowProgress,
    composedGesture: closeComposedGesture,
  } = useSearchGestures(toggleSearch);

  const keyboardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: keyboardHeight.get() }],
  }));

  return (
    <>
      <Animated.View style={[styles.container, { paddingBottom: bottomPadding }, keyboardStyle]}>
        <TabBarPill
          activeTab={activeTab}
          onTabPress={handleTabPress}
          searchProgress={searchProgress}
          menuProgress={menuProgress}
          pillAnimatedStyle={pillAnimatedStyle}
          pillPressed={pillPressed}
          overflowX={overflowX}
          overflowY={overflowY}
          touchX={touchX}
          touchY={touchY}
          glowProgress={glowProgress}
          hoveredTab={hoveredTab}
          panGesture={panGesture}
        />
        <SearchButton
          searchProgress={searchProgress}
          isSearchActive={isSearchActive}
          pressed={searchPressed}
          overflowX={searchOverflowX}
          overflowY={searchOverflowY}
          touchX={searchTouchX}
          touchY={searchTouchY}
          glowProgress={searchGlowProgress}
          composedGesture={searchComposedGesture}
        />
        <CloseSearchButton
          searchProgress={searchProgress}
          pressed={closePressed}
          overflowX={closeOverflowX}
          overflowY={closeOverflowY}
          touchX={closeTouchX}
          touchY={closeTouchY}
          glowProgress={closeGlowProgress}
          composedGesture={closeComposedGesture}
        />
      </Animated.View>
      {isMenuOpen && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={toggleMenu}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
  },
});
