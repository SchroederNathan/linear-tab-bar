import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { COLORS } from "../../constants/theme";
import { type ReactNode, useCallback, useId, useMemo, useState } from "react";

const FILL_GRADIENT_START = { x: 0.5, y: 0 };
const FILL_GRADIENT_END = { x: 0.5, y: 1 };

const SHEEN_EXTEND = -0.01;
/** Sheen angle: degrees clockwise from horizontal (+y down). */
const SHEEN_ANGLE_DEG = 63;
const SHEEN_RAD = (Math.PI / 180) * SHEEN_ANGLE_DEG;
const SHEEN_UX = Math.cos(SHEEN_RAD);
const SHEEN_UY = Math.sin(SHEEN_RAD);

function sheenGradientLine(w: number, h: number) {
  const pad = Math.max(w, h) * SHEEN_EXTEND;
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.hypot(w, h) / 2 + pad;
  return {
    x1: cx - R * SHEEN_UX,
    y1: cy - R * SHEEN_UY,
    x2: cx + R * SHEEN_UX,
    y2: cy + R * SHEEN_UY,
  };
}

interface BorderSheenProps {
  borderRadius: number;
}

function BorderSheen({ borderRadius }: BorderSheenProps) {
  const rawId = useId();
  const gradId = useMemo(() => rawId.replace(/:/g, ""), [rawId]);
  const [{ w, h }, setSize] = useState({ w: 0, h: 0 });
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      prev.w === width && prev.h === height ? prev : { w: width, h: height }
    );
  }, []);

  const stroke = 2;
  const rx = Math.min(
    borderRadius,
    w > 0 && h > 0 ? Math.min(w, h) / 2 : borderRadius
  );

  if (w < stroke * 2 || h < stroke * 2) {
    return <View style={StyleSheet.absoluteFill} onLayout={onLayout} />;
  }

  const innerW = w - stroke;
  const innerH = h - stroke;
  const x = stroke / 2;
  const y = stroke / 2;
  const { x1, y1, x2, y2 } = sheenGradientLine(w, h);

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none">
      <Svg width={w} height={h}>
        <Defs>
          <SvgLinearGradient
            id={gradId}
            gradientUnits="userSpaceOnUse"
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
          >
            <Stop offset="0%" stopColor="#fff" stopOpacity={0.5} />
            <Stop offset="28%" stopColor="#fff" stopOpacity={0} />
            <Stop offset="72%" stopColor="#fff" stopOpacity={0} />
            <Stop offset="100%" stopColor="#fff" stopOpacity={0.22} />
          </SvgLinearGradient>
        </Defs>
        <Rect
          x={x}
          y={y}
          width={innerW}
          height={innerH}
          rx={rx}
          ry={rx}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
        />
      </Svg>
    </View>
  );
}

interface GlassMaterialProps {
  children: ReactNode;
  style?: ViewStyle;
  borderRadius?: number;
}

export default function GlassMaterial({ children, style, borderRadius = 32 }: GlassMaterialProps) {
  const fill = useMemo(
    () => [StyleSheet.absoluteFill, { borderRadius, overflow: "hidden" as const }],
    [borderRadius]
  );

  return (
    <View
      style={[{ borderRadius, overflow: "hidden" }, style]}
      collapsable={false}
    >
      <BlurView tint="dark" intensity={40} style={fill} />
      <LinearGradient
        colors={[COLORS.glassGradientTop, COLORS.glassGradientBottom]}
        start={FILL_GRADIENT_START}
        end={FILL_GRADIENT_END}
        style={fill}
      />
      <BorderSheen borderRadius={borderRadius} />
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: StyleSheet.absoluteFillObject,
});
