import { Box, ChevronsUpDown, ScanFace, Star, type LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import Animated, { type AnimatedStyle, type SharedValue } from "react-native-reanimated";
import {
  ICON_PADDING,
  PILL_BORDER_RADIUS,
  PILL_HEIGHT,
} from "../../constants/layout";
import GlassMaterial from "./GlassMaterial";
import TabIcon from "./TabIcon";

const TAB_ICONS: LucideIcon[] = [Box, ScanFace, Star, ChevronsUpDown];

interface TabBarPillProps {
  activeTab: number;
  onTabPress: (index: number) => void;
  searchProgress: SharedValue<number>;
  pillAnimatedStyle: AnimatedStyle;
  onBackPress: () => void;
}

export default function TabBarPill({
  activeTab,
  onTabPress,
  searchProgress,
  pillAnimatedStyle,
  onBackPress,
}: TabBarPillProps) {
  return (
    <Animated.View
      style={[
        styles.pill,
        pillAnimatedStyle,
        styles.pillSurface,
        { borderRadius: PILL_BORDER_RADIUS },
      ]}
    >
      <GlassMaterial
        borderRadius={PILL_BORDER_RADIUS}
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
              showDot={index === 3}
              onBackPress={onBackPress}
              isCircle={index === 3}
            />
          ))}
        </View>
      </GlassMaterial>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: PILL_HEIGHT,
    justifyContent: "center",
  },
  /** Blur ignores many clip paths unless this native view owns bounds + clip. */
  pillSurface: {
    overflow: "hidden",
  },
  glassMaterial: {
    flex: 1,
    alignSelf: "stretch",
    minWidth: 0,
  },
  iconsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: ICON_PADDING,
    paddingVertical: 4,
    gap: 0,
  },
});
