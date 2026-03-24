import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, { type AnimatedStyle, type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { COLORS } from "../../constants/theme";
import { type ReactNode, useMemo } from "react";

const FILL_GRADIENT_START = { x: 0.5, y: 0 };
const FILL_GRADIENT_END = { x: 0.5, y: 1 };

interface GlassMaterialProps {
  children: ReactNode;
  style?: ViewStyle | AnimatedStyle | (ViewStyle | AnimatedStyle)[];
  borderRadius?: number | SharedValue<number>;
}

export default function GlassMaterial({ children, style, borderRadius = 32 }: GlassMaterialProps) {
  const isAnimated = typeof borderRadius === 'object' && 'get' in borderRadius;
  const staticRadius = isAnimated ? undefined : borderRadius;

  const fill = useMemo(
    () => [StyleSheet.absoluteFill, { borderRadius: staticRadius, overflow: "hidden" as const }],
    [staticRadius]
  );

  const animatedOuter = useAnimatedStyle(() => {
    if (!isAnimated) return {};
    return { borderRadius: (borderRadius as SharedValue<number>).get(), overflow: "hidden" as const };
  });

  const animatedSheen = useAnimatedStyle(() => {
    if (!isAnimated) return {};
    return { borderRadius: (borderRadius as SharedValue<number>).get() };
  });

  return (
    <Animated.View
      style={[{ borderRadius: staticRadius, overflow: "hidden" }, isAnimated && animatedOuter, style]}
      collapsable={false}
    >
      <BlurView tint="dark" intensity={40} style={fill} />
      <LinearGradient
        colors={[COLORS.glassGradientTop, COLORS.glassGradientBottom]}
        start={FILL_GRADIENT_START}
        end={FILL_GRADIENT_END}
        style={fill}
      />
      {/* Border sheen using a View border — GPU-accelerated, no SVG lag */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: staticRadius,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderTopColor: 'rgba(255, 255, 255, 0.25)',
            borderBottomColor: 'rgba(255, 255, 255, 0.06)',
          },
          isAnimated && animatedSheen,
        ]}
        pointerEvents="none"
      />
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: StyleSheet.absoluteFillObject,
});
