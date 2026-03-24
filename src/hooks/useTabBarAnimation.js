import { useCallback, useState } from 'react';
import { useSharedValue, withSpring, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { SPRING } from '../constants/theme';
import {
  PILL_WIDTH,
  SEARCH_BUTTON_SIZE,
  SEARCH_BAR_WIDTH,
  PILL_HEIGHT,
  PILL_BORDER_RADIUS,
  SEARCH_BAR_RADIUS,
} from '../constants/layout';

export default function useTabBarAnimation() {
  const searchProgress = useSharedValue(0);
  const [activeTab, setActiveTab] = useState(0);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const toggleSearch = useCallback(() => {
    const toValue = searchProgress.value < 0.5 ? 1 : 0;
    searchProgress.value = withSpring(toValue, SPRING);
    setIsSearchActive(toValue === 1);
  }, [searchProgress]);

  const pillAnimatedStyle = useAnimatedStyle(() => {
    const progress = searchProgress.value;
    return {
      width: interpolate(progress, [0, 1], [PILL_WIDTH, SEARCH_BUTTON_SIZE]),
    };
  });

  const searchAnimatedStyle = useAnimatedStyle(() => {
    const progress = searchProgress.value;
    return {
      width: interpolate(progress, [0, 1], [SEARCH_BUTTON_SIZE, SEARCH_BAR_WIDTH]),
    };
  });

  const getIconAnimatedStyle = useCallback((index) => {
    return () => {
      'worklet';
      const progress = searchProgress.value;
      if (index === 0) {
        return {
          opacity: 1,
          transform: [{ scale: 1 }],
        };
      }
      return {
        opacity: interpolate(progress, [0, 0.3], [1, 0]),
        transform: [{ scale: interpolate(progress, [0, 0.3], [1, 0.5]) }],
      };
    };
  }, []);

  return {
    searchProgress,
    activeTab,
    setActiveTab,
    isSearchActive,
    toggleSearch,
    pillAnimatedStyle,
    searchAnimatedStyle,
    getIconAnimatedStyle,
  };
}
