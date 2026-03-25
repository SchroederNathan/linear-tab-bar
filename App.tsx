import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import TabBar from "./src/components/TabBar";
import PlaceholderScreen from "./src/components/Screens/PlaceholderScreen";
import { COLORS } from "./src/components/TabBar/constants";

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <View style={styles.content}>
            <PlaceholderScreen tabIndex={activeTab} />
          </View>
          <TabBar onTabChange={setActiveTab} />
          <StatusBar style="light" />
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
});
