import { Colors } from "@/constants/theme";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const { colorScheme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLocalization();
  const colors = Colors[colorScheme || "light"];

  const SettingSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.icon }]}>{title}</Text>
      <View
        style={[
          styles.sectionContent,
          {
            backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFFFFF",
            borderColor: colorScheme === "dark" ? "#2A2A2A" : "#E5E5E5",
          },
        ]}
      >
        {children}
      </View>
    </View>
  );

  const SettingRow = ({
    icon,
    label,
    value,
    onPress,
    showArrow = false,
    rightComponent,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={styles.settingLeft}>
        <Ionicons
          name={icon}
          size={24}
          color={colors.icon}
          style={styles.settingIcon}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            {label}
          </Text>
          {value && (
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {value}
            </Text>
          )}
        </View>
      </View>
      {rightComponent ||
        (showArrow && (
          <Ionicons name="chevron-forward" size={20} color={colors.icon} />
        ))}
    </TouchableOpacity>
  );

  const Divider = () => (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: colorScheme === "dark" ? "#2A2A2A" : "#E5E5E5",
        },
      ]}
    />
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("settings.title")}
        </Text>
      </View>

      <SettingSection title={t("settings.appearance")}>
        <SettingRow
          icon="moon-outline"
          label={t("settings.theme")}
          value={
            colorScheme === "dark" ? t("settings.dark") : t("settings.light")
          }
          rightComponent={
            <Switch
              value={colorScheme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: "#D1D1D6", true: colors.tint }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D1D6"
            />
          }
        />
      </SettingSection>

      <SettingSection title={t("settings.languageSection")}>
        <SettingRow
          icon="language-outline"
          label={t("settings.english")}
          rightComponent={
            <TouchableOpacity
              onPress={() => setLanguage("en")}
              style={styles.radioButton}
            >
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: colors.tint },
                  language === "en" && { borderWidth: 2 },
                ]}
              >
                {language === "en" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: colors.tint },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          }
        />
        <Divider />
        <SettingRow
          icon="language-outline"
          label={t("settings.russian")}
          rightComponent={
            <TouchableOpacity
              onPress={() => setLanguage("ru")}
              style={styles.radioButton}
            >
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: colors.tint },
                  language === "ru" && { borderWidth: 2 },
                ]}
              >
                {language === "ru" && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: colors.tint },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          }
        />
      </SettingSection>

      <SettingSection title={t("settings.about")}>
        <SettingRow
          icon="information-circle-outline"
          label={t("settings.appName")}
          value="Remote Job Hunting Platform"
        />
        <Divider />
        <SettingRow
          icon="code-slash-outline"
          label={t("settings.version")}
          value="1.0.0"
        />
      </SettingSection>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.icon }]}>
          Made with ❤️ for BSUIR
        </Text>
        <Text style={[styles.footerText, { color: colors.icon }]}>
          Mobile Development Lab #1
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    minHeight: 56,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingValue: {
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 52,
  },
  radioButton: {
    padding: 4,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
});
