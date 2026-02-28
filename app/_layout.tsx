import { LoadingSpinner } from "@/components/LoadingSpinner";
import { NetworkBanner } from "@/components/NetworkBanner";
import { LocalizationProvider } from "@/contexts/LocalizationContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import "react-native-reanimated";

function RootLayoutContent() {
  const { colorScheme, isLoading } = useTheme();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <View style={styles.root}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="job/[id]"
            options={{
              presentation: "card",
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="add-job"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="edit-job/[id]"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
        <NetworkBanner />
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </View>
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LocalizationProvider>
        <RootLayoutContent />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
