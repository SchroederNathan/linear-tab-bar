import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const TAB_BAR_HORIZONTAL_PADDING = 16;
export const TAB_BAR_GAP = 12;

export const PILL_HEIGHT = 52;
export const PILL_BORDER_RADIUS = PILL_HEIGHT / 2;

export const ICON_SIZE = 22;
export const ICON_SPACING = 52;
export const ICON_STROKE_WIDTH = 3;
export const ICON_PADDING = 4;

export const SEARCH_BUTTON_SIZE = 52;
export const SEARCH_BAR_RADIUS = PILL_BORDER_RADIUS;

// Total available width for pill + search
export const TOTAL_WIDTH = SCREEN_WIDTH - 2 * TAB_BAR_HORIZONTAL_PADDING;

// Default state: pill takes most space, search is a circle
export const PILL_WIDTH = TOTAL_WIDTH - TAB_BAR_GAP - SEARCH_BUTTON_SIZE;

// Search state: search takes most space, pill is a circle
export const SEARCH_BAR_WIDTH = TOTAL_WIDTH - TAB_BAR_GAP - SEARCH_BUTTON_SIZE;

export const TAB_BAR_BOTTOM_PADDING = 8;
