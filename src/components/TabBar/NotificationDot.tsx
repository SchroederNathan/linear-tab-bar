import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, type SharedValue } from 'react-native-reanimated';
import { COLORS } from '../../constants/theme';

interface NotificationDotProps {
  searchProgress: SharedValue<number>;
}

export default function NotificationDot({ searchProgress }: NotificationDotProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(searchProgress.value, [0, 0.3], [1, 0]),
    transform: [{ scale: interpolate(searchProgress.value, [0, 0.3], [1, 0]) }],
  }));

  return (
    <Animated.View style={[styles.dot, animatedStyle]} />
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.accentBlue,
  },
});
