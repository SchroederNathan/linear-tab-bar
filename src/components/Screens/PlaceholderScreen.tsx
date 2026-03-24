import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/theme';

interface Screen {
  name: string;
  color: string;
}

const SCREENS: Screen[] = [
  { name: 'Projects', color: '#0A0A0A' },
  { name: 'Discover', color: '#0A0A0A' },
  { name: 'Favorites', color: '#0A0A0A' },
  { name: 'Settings', color: '#0A0A0A' },
];

interface PlaceholderScreenProps {
  tabIndex: number;
}

export default function PlaceholderScreen({ tabIndex }: PlaceholderScreenProps) {
  const screen = SCREENS[tabIndex] || SCREENS[0];

  return (
    <View style={[styles.container, { backgroundColor: screen.color }]}>
      <Text style={styles.title}>{screen.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
