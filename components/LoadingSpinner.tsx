import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function LoadingSpinner() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme || "light"];

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
