import { useCallback, useState } from 'react';
import { Keyboard } from 'react-native';
import { useSharedValue, withSpring, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { SPRING } from '../constants/theme';
import {
  PILL_WIDTH,
  TAB_BAR_GAP,
} from '../constants/layout';

export default function useTabBarAnimation() {
  const searchProgress = useSharedValue(0);
  const [activeTab, setActiveTab] = useState(0);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const toggleSearch = useCallback(() => {
    const opening = searchProgress.value < 0.5;
    if (!opening) {
      Keyboard.dismiss();
    }
    searchProgress.value = withSpring(opening ? 1 : 0, SPRING);
    setIsSearchActive(opening);
  }, [searchProgress]);

  const pillAnimatedStyle = useAnimatedStyle(() => {
    const progress = searchProgress.value;
    return {
      width: interpolate(progress, [0, 0.6], [PILL_WIDTH, 0], 'clamp'),
      opacity: interpolate(progress, [0, 0.3], [1, 0], 'clamp'),
      marginRight: interpolate(progress, [0, 0.6], [TAB_BAR_GAP, 0], 'clamp'),
      transform: [
        { translateX: interpolate(progress, [0, 0.6], [0, -PILL_WIDTH * 0.3], 'clamp') },
      ],
    };
  });

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    flex: 1,
  }));

  const getIconAnimatedStyle = useCallback((index: number) => {
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
