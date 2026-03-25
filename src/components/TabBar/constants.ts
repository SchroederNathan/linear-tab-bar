import { Dimensions } from 'react-native';
import { interpolate } from 'react-native-reanimated';

// --- Layout ---

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const TAB_BAR_HORIZONTAL_PADDING = 16;
export const TAB_BAR_GAP = 12;

export const PILL_HEIGHT = 52;
export const SEARCH_ACTIVE_HEIGHT = 42;
export const PILL_BORDER_RADIUS = PILL_HEIGHT / 2;
export const SEARCH_ACTIVE_RADIUS = SEARCH_ACTIVE_HEIGHT / 2;

export const ICON_SIZE = 22;
export const ICON_SPACING = 52;
export const ICON_STROKE_WIDTH = 3;
export const ICON_PADDING = 4;

export const SEARCH_BUTTON_SIZE = 52;
export const SEARCH_BAR_RADIUS = PILL_BORDER_RADIUS;

export const TOTAL_WIDTH = SCREEN_WIDTH - 2 * TAB_BAR_HORIZONTAL_PADDING;

export const PILL_WIDTH = TOTAL_WIDTH - TAB_BAR_GAP - SEARCH_BUTTON_SIZE;

export const CLOSE_BUTTON_SIZE = SEARCH_BUTTON_SIZE;

export const SEARCH_BAR_WIDTH = TOTAL_WIDTH - TAB_BAR_GAP - CLOSE_BUTTON_SIZE;

export const TAB_BAR_BOTTOM_PADDING = 8;

export const MENU_WIDTH = TOTAL_WIDTH;
export const MENU_HEIGHT = 420;
export const MENU_BORDER_RADIUS = 38;
export const MENU_ITEM_HEIGHT = 48;

// --- Tab Zone Constants ---

export const MAX_SWITCHABLE_TAB = 2;
export const CIRCLE_SIZE = PILL_HEIGHT - 8;

export const TABS_START = ICON_PADDING;
export const TABS_END = PILL_WIDTH - ICON_PADDING - CIRCLE_SIZE;
export const TAB_ZONE_WIDTH = (TABS_END - TABS_START) / 3;

export const MENU_DRAG_THRESHOLD = -50;

export const TAB_CENTER_XS = [
  TABS_START + TAB_ZONE_WIDTH * 0.5,
  TABS_START + TAB_ZONE_WIDTH * 1.5,
  TABS_START + TAB_ZONE_WIDTH * 2.5,
  PILL_WIDTH - ICON_PADDING - CIRCLE_SIZE / 2,
] as const;

// --- Theme ---

export const COLORS = {
  background: '#0A0A0A',
  surface: 'rgba(255, 255, 255, 0.06)',
  surfaceHover: 'rgba(255, 255, 255, 0.12)',
  textPrimary: 'rgba(255, 255, 255, 0.9)',
  textSecondary: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(255, 255, 255, 0.12)',
  glassGradientTop: 'rgba(255, 255, 255, 0.11)',
  glassGradientBottom: 'rgba(255, 255, 255, 0.05)',
  accentBlue: '#3B82F6',
  iconDefault: 'rgba(255, 255, 255, 0.9)',
  iconActive: 'rgba(255, 255, 255, 0.9)',
  borderGradientBright: 'rgba(255, 255, 255, 0.15)',
  borderGradientDim: 'rgba(255, 255, 255, 0.01)',
  borderGradientMedium: 'rgba(255, 255, 255, 0.06)',
} as const;

export const SPRING = {
  damping: 24,
  stiffness: 170,
  mass: 1,
} as const;

export const SPRING_BOUNCY = {
  damping: 22,
  stiffness: 250,
  mass: 0.6,
} as const;

export const SPRING_MENU_OPEN = {
  damping: 14,
  stiffness: 170,
  mass: 0.7,
} as const;

export const SPRING_MENU_CLOSE = {
  damping: 22,
  stiffness: 120,
  mass: 0.9,
} as const;

// --- Liquid Glass ---

const MAX_PULL = 60;
const MAX_STRETCH = 0.1;
const MAX_COMPRESS = 0.12;

export function liquidGlassTransform(
  pressed: number,
  overflowX: number,
  overflowY: number,
  halfW: number,
  halfH: number,
) {
  "worklet";

  const pressScale = interpolate(pressed, [0, 1], [1, 1.02]);

  const signX = overflowX < 0 ? -1 : 1;
  const dampedX = signX * MAX_PULL * (1 - 1 / (Math.abs(overflowX) / MAX_PULL + 1));
  const signY = overflowY < 0 ? -1 : 1;
  const dampedY = signY * MAX_PULL * (1 - 1 / (Math.abs(overflowY) / MAX_PULL + 1));

  const absDX = Math.abs(dampedX);
  const absDY = Math.abs(dampedY);

  const stretchX = interpolate(absDX, [0, MAX_PULL], [0, MAX_STRETCH], "clamp");
  const stretchY = interpolate(absDY, [0, MAX_PULL], [0, MAX_STRETCH], "clamp");

  const compressX = interpolate(absDY, [0, MAX_PULL], [0, MAX_COMPRESS], "clamp");
  const compressY = interpolate(absDX, [0, MAX_PULL], [0, MAX_COMPRESS], "clamp");

  return {
    transform: [
      { translateX: signX * halfW * stretchX },
      { translateY: signY * halfH * stretchY },
      { scaleX: pressScale * (1 + stretchX) * (1 - compressX) },
      { scaleY: pressScale * (1 + stretchY) * (1 - compressY) },
    ],
  };
}
