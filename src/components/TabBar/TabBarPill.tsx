import {
  Box,
  ChevronsUpDown,
  ScanFace,
  Star,
  type LucideIcon,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { GestureDetector, type GestureType, type ComposedGesture } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  type AnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect,
} from "react-native-svg";
import {
  ICON_PADDING,
  MENU_BORDER_RADIUS,
  PILL_BORDER_RADIUS,
  PILL_HEIGHT,
  PILL_WIDTH,
} from "../../constants/layout";
import { liquidGlassTransform } from "../../utils/liquidGlass";
import GlassMaterial from "./GlassMaterial";
import MenuPanel from "./MenuPanel";
import TabIcon from "./TabIcon";

const TAB_ICONS: LucideIcon[] = [Box, ScanFace, Star, ChevronsUpDown];

const HALF_W = PILL_WIDTH / 2;
const HALF_H = PILL_HEIGHT / 2;

// Glow constants
const GLOW_SIZE = 200;
const GLOW_HALF = GLOW_SIZE / 2;

interface TabBarPillProps {
  activeTab: number;
  onTabPress: (index: number) => void;
  searchProgress: SharedValue<number>;
  menuProgress: SharedValue<number>;
  pillAnimatedStyle: AnimatedStyle;
  pillPressed: SharedValue<number>;
  overflowX: SharedValue<number>;
  overflowY: SharedValue<number>;
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  glowProgress: SharedValue<number>;
  hoveredTab: SharedValue<number>;
  panGesture: ComposedGesture | GestureType;
}

export default function TabBarPill({
  activeTab,
  onTabPress,
  searchProgress,
  menuProgress,
  pillAnimatedStyle,
  pillPressed,
  overflowX,
  overflowY,
  touchX,
  touchY,
  glowProgress,
  hoveredTab,
  panGesture,
}: TabBarPillProps) {
  const animatedBorderRadius = useDerivedValue(() =>
    interpolate(menuProgress.get(), [0, 0.8], [PILL_BORDER_RADIUS, MENU_BORDER_RADIUS], 'clamp')
  );

  const pillGlassStyle = useAnimatedStyle(() => {
    // Disable stretch when menu is open
    if (menuProgress.get() > 0.5) {
      return {
        transform: [
          { translateX: 0 },
          { translateY: 0 },
          { scaleX: 1 },
          { scaleY: 1 },
        ],
      };
    }

    return liquidGlassTransform(
      pillPressed.get(), overflowX.get(), overflowY.get(), HALF_W, HALF_H,
    );
  });

  const glowStyle = useAnimatedStyle(() => {
    const progress = glowProgress.get();
    const opacity = progress <= 1
      ? progress * 0.2
      : interpolate(progress, [1, 2], [0.2, 0], "clamp");
    const scale = progress <= 1
      ? 1
      : interpolate(progress, [1, 2], [1, 4], "clamp");

    return {
      opacity,
      transform: [
        { translateX: touchX.get() - GLOW_HALF },
        { translateY: touchY.get() - GLOW_HALF },
        { scale },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={pillGlassStyle}>
        <Animated.View
          style={[
            styles.pill,
            pillAnimatedStyle,
            styles.pillSurface,
          ]}
        >
          <GlassMaterial
            borderRadius={animatedBorderRadius}
            style={styles.glassMaterial}
          >
            <View style={styles.iconsRow}>
              {TAB_ICONS.map((Icon, index) => (
                <TabIcon
                  key={index}
                  index={index}
                  icon={Icon}
                  isActive={index < 3 && activeTab === index}
                  onPress={onTabPress}
                  searchProgress={searchProgress}
                  menuProgress={menuProgress}
                  showDot={index === 3}
                  isCircle={index === 3}
                  pillPressed={pillPressed}
                  touchX={touchX}
                  touchY={touchY}
                  glowProgress={glowProgress}
                  hoveredTab={hoveredTab}
                />
              ))}
            </View>
            <MenuPanel menuProgress={menuProgress} />
          </GlassMaterial>
          <Animated.View
            style={[styles.glowContainer, glowStyle]}
            pointerEvents="none"
          >
            <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
              <Defs>
                <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#fff" stopOpacity={1} />
                  <Stop offset="100%" stopColor="#fff" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect
                width={GLOW_SIZE}
                height={GLOW_SIZE}
                fill="url(#glow)"
              />
            </Svg>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  pill: {
    justifyContent: "flex-start",
  },
  pillSurface: {
    overflow: "hidden",
  },
  glassMaterial: {
    flex: 1,
    alignSelf: "stretch",
    minWidth: 0,
  },
  iconsRow: {
    flexDirection: "row",
    alignItems: "center",
    height: PILL_HEIGHT,
    paddingHorizontal: ICON_PADDING,
    paddingVertical: 4,
    gap: 0,
  },
  glowContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
  },
});
