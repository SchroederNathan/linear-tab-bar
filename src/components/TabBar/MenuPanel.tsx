import {
  Inbox,
  CircleDot,
  Star,
  FolderKanban,
  Layers,
  Users,
  Settings,
  SlidersHorizontal,
  type LucideIcon,
  ChevronsUpDown,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { MENU_ITEM_HEIGHT, COLORS } from "./constants";

interface MenuItemData {
  icon: LucideIcon;
  label: string;
  highlighted?: boolean;
}

const MENU_ITEMS: MenuItemData[] = [
  { icon: Inbox, label: "Inbox" },
  { icon: CircleDot, label: "My Issues" },
  { icon: Star, label: "Favorites", highlighted: true },
  { icon: FolderKanban, label: "Projects" },
  { icon: Layers, label: "Views" },
  { icon: Users, label: "Teams" },
  { icon: Settings, label: "Settings" },
];

const STAGGER_IN_MS = 40;
const STAGGER_OUT_MS = 10;
const ITEM_IN_DURATION = 250;
const ITEM_OUT_DURATION = 80;

interface MenuPanelProps {
  menuProgress: SharedValue<number>;
}

const MenuItem = React.memo(function MenuItem({
  item,
  itemProgress,
}: {
  item: MenuItemData;
  itemProgress: SharedValue<number>;
}) {
  const Icon = item.icon;

  const style = useAnimatedStyle(() => {
    const p = itemProgress.get();
    return {
      opacity: p,
      transform: [
        { translateY: interpolate(p, [0, 1], [-10, 0]) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.menuItem,
        item.highlighted && styles.menuItemHighlighted,
        style,
      ]}
    >
      <Icon
        size={20}
        color={COLORS.iconDefault}
        strokeWidth={2.5}
      />
      <Text style={styles.menuItemLabel}>{item.label}</Text>
    </Animated.View>
  );
});

export default function MenuPanel({ menuProgress }: MenuPanelProps) {
  // Individual progress values: header, divider, 7 menu items
  const headerProgress = useSharedValue(0);
  const dividerProgress = useSharedValue(0);
  const itemProgresses = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];

  const containerProgress = useSharedValue(0);
  const wasOpen = useSharedValue(false);

  // Watch menuProgress to trigger stagger
  useAnimatedReaction(
    () => menuProgress.get(),
    (current, previous) => {
      const prev = previous ?? 0;
      const goingUp = current > prev;

      if (goingUp && current > 0.1 && !wasOpen.get()) {
        wasOpen.set(true);
        containerProgress.set(withTiming(1, { duration: 200 }));
        // Stagger in top-to-bottom
        headerProgress.set(withDelay(0 * STAGGER_IN_MS, withTiming(1, { duration: ITEM_IN_DURATION })));
        dividerProgress.set(withDelay(1 * STAGGER_IN_MS, withTiming(1, { duration: ITEM_IN_DURATION })));
        itemProgresses[0].set(withDelay(2 * STAGGER_IN_MS, withTiming(1, { duration: ITEM_IN_DURATION })));
        itemProgresses[1].set(withDelay(3 * STAGGER_IN_MS, withTiming(1, { duration: ITEM_IN_DURATION })));
        itemProgresses[2].set(withDelay(4 * STAGGER_IN_MS, withTiming(1, { duration: ITEM_IN_DURATION })));
        itemProgresses[3].set(withDelay(5 * STAGGER_IN_MS, withTiming(1, { duration: ITEM_IN_DURATION })));
        itemProgresses[4].set(withDelay(6 * STAGGER_IN_MS, withTiming(1, { duration: ITEM_IN_DURATION })));
        itemProgresses[5].set(withDelay(7 * STAGGER_IN_MS, withTiming(1, { duration: ITEM_IN_DURATION })));
        itemProgresses[6].set(withDelay(8 * STAGGER_IN_MS, withTiming(1, { duration: ITEM_IN_DURATION })));
      } else if (!goingUp && current < 0.95 && wasOpen.get()) {
        wasOpen.set(false);
        containerProgress.set(withTiming(0, { duration: 150 }));
        // Stagger out bottom-to-top (reverse order)
        itemProgresses[6].set(withDelay(0 * STAGGER_OUT_MS, withTiming(0, { duration: ITEM_OUT_DURATION })));
        itemProgresses[5].set(withDelay(1 * STAGGER_OUT_MS, withTiming(0, { duration: ITEM_OUT_DURATION })));
        itemProgresses[4].set(withDelay(2 * STAGGER_OUT_MS, withTiming(0, { duration: ITEM_OUT_DURATION })));
        itemProgresses[3].set(withDelay(3 * STAGGER_OUT_MS, withTiming(0, { duration: ITEM_OUT_DURATION })));
        itemProgresses[2].set(withDelay(4 * STAGGER_OUT_MS, withTiming(0, { duration: ITEM_OUT_DURATION })));
        itemProgresses[1].set(withDelay(5 * STAGGER_OUT_MS, withTiming(0, { duration: ITEM_OUT_DURATION })));
        itemProgresses[0].set(withDelay(6 * STAGGER_OUT_MS, withTiming(0, { duration: ITEM_OUT_DURATION })));
        dividerProgress.set(withDelay(7 * STAGGER_OUT_MS, withTiming(0, { duration: ITEM_OUT_DURATION })));
        headerProgress.set(withDelay(8 * STAGGER_OUT_MS, withTiming(0, { duration: ITEM_OUT_DURATION })));
      }
    },
  );

  const containerStyle = useAnimatedStyle(() => {
    const p = menuProgress.get();
    return {
      opacity: p,
      transform: [
        { scale: interpolate(p, [0, 1], [0.8, 1]) },
        { translateY: interpolate(p, [0, 1], [-200, 0]) },
      ],
    };
  });

  const headerStyle = useAnimatedStyle(() => {
    const p = headerProgress.get();
    return {
      opacity: p,
      transform: [
        { translateY: interpolate(p, [0, 1], [-10, 0]) },
      ],
    };
  });

  const dividerStyle = useAnimatedStyle(() => ({
    opacity: dividerProgress.get(),
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerName}>SchroederNathan</Text>
          <ChevronsUpDown
            size={14}
            color={COLORS.textPrimary}
            strokeWidth={2.5}
          />
        </View>
        <SlidersHorizontal
          size={20}
          color={COLORS.textPrimary}
          strokeWidth={2.5}
        />
      </Animated.View>

      {/* Divider */}
      <Animated.View style={[styles.dividerContainer, dividerStyle]}>
        <View style={styles.divider} />
      </Animated.View>

      {/* Menu Items */}
      {MENU_ITEMS.map((item, index) => (
        <MenuItem
          key={item.label}
          item={item}
          itemProgress={itemProgresses[index]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  dividerContainer: {
    paddingBottom: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    height: MENU_ITEM_HEIGHT,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 14,
  },
  menuItemHighlighted: {
    backgroundColor: COLORS.surfaceHover,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
});
