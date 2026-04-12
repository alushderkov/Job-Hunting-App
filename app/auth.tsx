import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AuthScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { t } = useLocalization();
  const { signIn, signUp } = useAuth();
  const colors = Colors[colorScheme || "light"];
  const isDark = colorScheme === "dark";

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(t("common.error"), t("auth.fillFields"));
      return;
    }

    if (username.trim().length < 3) {
      Alert.alert(t("common.error"), t("auth.usernameTooShort"));
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert(t("common.error"), t("auth.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t("common.error"), t("auth.passwordTooShort"));
      return;
    }

    setIsLoading(true);
    try {
      const result = isLogin
        ? await signIn(username, password)
        : await signUp(username, password);

      if (result.error) {
        Alert.alert(t("common.error"), result.error);
      } else {
        router.replace("/(tabs)" as any);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.tint + "20" },
              ]}
            >
              <Ionicons name="briefcase" size={48} color={colors.tint} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Job Hunting
            </Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>
              {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5",
                  borderColor: isDark ? "#3A3A3A" : "#E0E0E0",
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.icon}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t("auth.username")}
                placeholderTextColor={colors.icon}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5",
                  borderColor: isDark ? "#3A3A3A" : "#E0E0E0",
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.icon}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t("auth.password")}
                placeholderTextColor={colors.icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.icon}
                />
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5",
                    borderColor: isDark ? "#3A3A3A" : "#E0E0E0",
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t("auth.confirmPassword")}
                  placeholderTextColor={colors.icon}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.tint }]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? t("auth.signIn") : t("auth.signUp")}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleText, { color: colors.icon }]}>
              {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsLogin(!isLogin);
                setConfirmPassword("");
              }}
            >
              <Text style={[styles.toggleLink, { color: colors.tint }]}>
                {isLogin ? t("auth.signUp") : t("auth.signIn")}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  toggleText: {
    fontSize: 15,
  },
  toggleLink: {
    fontSize: 15,
    fontWeight: "600",
  },
});
