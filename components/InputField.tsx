import React, { memo } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface InputFieldProps extends TextInputProps {
  label: string;
  colorScheme: "light" | "dark";
  textColor: string;
  iconColor: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export const InputField = memo(function InputField({
  label,
  colorScheme,
  textColor,
  iconColor,
  multiline = false,
  numberOfLines = 1,
  ...rest
}: InputFieldProps) {
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          {
            backgroundColor: isDark ? "#1E1E1E" : "#F5F5F5",
            color: textColor,
            borderColor: isDark ? "#2A2A2A" : "#E0E0E0",
          },
        ]}
        placeholderTextColor={iconColor}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? "top" : "center"}
        {...rest}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  multilineInput: {
    minHeight: 120,
    paddingTop: 12,
  },
});
