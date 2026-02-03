import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme || "light"];

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={80} color={colors.icon} style={styles.icon} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.icon }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
});
