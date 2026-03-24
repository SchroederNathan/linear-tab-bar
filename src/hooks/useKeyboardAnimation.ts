import { useAnimatedStyle } from 'react-native-reanimated';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';

export default function useKeyboardAnimation() {
  const { height } = useReanimatedKeyboardAnimation();

  const keyboardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: height.get() }],
  }));

  return { keyboardAnimatedStyle, keyboardHeight: height };
}
