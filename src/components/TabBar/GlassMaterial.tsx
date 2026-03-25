import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, { type AnimatedStyle, type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { COLORS } from "./constants";
import { type ReactNode, useMemo } from "react";

const FILL_GRADIENT_START = { x: 0.5, y: 0 };
const FILL_GRADIENT_END = { x: 0.5, y: 1 };

const BORDER_GRADIENT_START = { x: 0.49, y: 0 };
const BORDER_GRADIENT_END = { x: 0.51, y: 1 };
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

  const animatedBorderMask = useAnimatedStyle(() => {
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
      {/* Gradient border: mask a linear-gradient to only show through a 1px border ring */}
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <Animated.View
            style={[
              { flex: 1, borderWidth: 1, borderColor: 'black', borderRadius: staticRadius },
              isAnimated && animatedBorderMask,
            ]}
          />
        }
        pointerEvents="none"
      >
        <LinearGradient
          colors={[COLORS.borderGradientBright, COLORS.borderGradientDim, COLORS.borderGradientMedium]}
          start={BORDER_GRADIENT_START}
          end={BORDER_GRADIENT_END}
          locations={[0, 0.5, 1]}
          style={{ flex: 1 }}
        />
      </MaskedView>
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: StyleSheet.absoluteFillObject,
});
