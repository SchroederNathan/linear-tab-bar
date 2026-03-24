import { useCallback, useState } from 'react';
import { Keyboard } from 'react-native';
import {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  cancelAnimation,
} from 'react-native-reanimated';
import { SPRING, SPRING_MENU_OPEN, SPRING_MENU_CLOSE } from '../constants/theme';
import {
  MENU_BORDER_RADIUS,
  MENU_HEIGHT,
  MENU_WIDTH,
  PILL_BORDER_RADIUS,
  PILL_HEIGHT,
  PILL_WIDTH,
  TAB_BAR_GAP,
} from '../constants/layout';

export default function useTabBarAnimation() {
  const searchProgress = useSharedValue(0);
  const menuProgress = useSharedValue(0);
  const [activeTab, setActiveTab] = useState(0);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleSearch = useCallback(() => {
    // Guard: don't open search while menu is open
    if (menuProgress.value > 0.5) return;
    const opening = searchProgress.value < 0.5;
    if (!opening) {
      Keyboard.dismiss();
    }
    searchProgress.value = withSpring(opening ? 1 : 0, SPRING);
    setIsSearchActive(opening);
  }, [searchProgress, menuProgress]);

  const toggleMenu = useCallback(() => {
    // Guard: don't open menu while search is active
    if (searchProgress.value > 0.5) return;
    const opening = menuProgress.value < 0.5;
    cancelAnimation(menuProgress);
    menuProgress.value = withSpring(
      opening ? 1 : 0,
      opening ? SPRING_MENU_OPEN : SPRING_MENU_CLOSE,
    );
    setIsMenuOpen(opening);
  }, [menuProgress, searchProgress]);

  const pillAnimatedStyle = useAnimatedStyle(() => {
    const sp = searchProgress.value;
    const mp = menuProgress.value;

    const isMenu = mp > 0.01;

    if (isMenu) {
      // Squeeze via scaleX so layout width stays constant (search button doesn't move)
      const scaleX = interpolate(
        mp,
        [0, 0.15, 0.5, 0.85],
        [1, 0.7, 0.85, 1],
        'clamp',
      );
      // Height: starts after squeeze, allow overshoot past 1.0 for spring bounce
      const height = interpolate(
        mp,
        [0, 0.1, 1],
        [PILL_HEIGHT, PILL_HEIGHT, MENU_HEIGHT],
      );
      const borderRadius = interpolate(
        mp,
        [0, 0.8],
        [PILL_BORDER_RADIUS, MENU_BORDER_RADIUS],
        'clamp',
      );

      return {
        width: PILL_WIDTH,
        height,
        opacity: 1,
        marginRight: TAB_BAR_GAP,
        borderRadius,
        transform: [{ scaleX }],
      };
    }

    // Search-driven animation (existing)
    return {
      width: interpolate(sp, [0, 0.6], [PILL_WIDTH, 0], 'clamp'),
      height: PILL_HEIGHT,
      opacity: interpolate(sp, [0, 0.3], [1, 0], 'clamp'),
      marginRight: interpolate(sp, [0, 0.6], [TAB_BAR_GAP, 0], 'clamp'),
      borderRadius: PILL_BORDER_RADIUS,
      transform: [
        {
          translateX: interpolate(
            sp,
            [0, 0.6],
            [0, -PILL_WIDTH * 0.3],
            'clamp',
          ),
        },
      ],
    };
  });

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    flex: 1,
  }));

  const searchButtonMenuStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

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
    searchAnimatedStyle,
    searchButtonMenuStyle,
  };
}
