import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { t } = useLocalization();
  const { user, username, signOut } = useAuth();
  const colors = Colors[colorScheme || "light"];
  const isDark = colorScheme === "dark";

  const handleSignOut = () => {
    Alert.alert(t("profile.signOutConfirm"), t("profile.signOutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.signOut"),
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/auth" as any);
        },
      },
    ]);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("profile.title")}
        </Text>
      </View>

      {/* Avatar & Name */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <Text style={styles.avatarText}>{getInitials(username)}</Text>
        </View>
        <Text style={[styles.username, { color: colors.text }]}>
          {username || "—"}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isDark ? "#1a3a1a" : "#E8F5E9" },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: "#4CAF50" }]} />
          <Text style={[styles.statusText, { color: "#4CAF50" }]}>
            {t("profile.active")}
          </Text>
        </View>
      </View>

      {/* Info Cards */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
            borderColor: isDark ? "#2A2A2A" : "#E5E5E5",
          },
        ]}
      >
        <View style={styles.cardRow}>
          <Ionicons name="person-outline" size={20} color={colors.icon} />
          <View style={styles.cardRowContent}>
            <Text style={[styles.cardLabel, { color: colors.icon }]}>
              {t("profile.username")}
            </Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {username || "—"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#2A2A2A" : "#E5E5E5" },
          ]}
        />

        <View style={styles.cardRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.icon} />
          <View style={styles.cardRowContent}>
            <Text style={[styles.cardLabel, { color: colors.icon }]}>
              {t("profile.memberSince")}
            </Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {formatDate(user?.created_at)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#2A2A2A" : "#E5E5E5" },
          ]}
        />

        <View style={styles.cardRow}>
          <Ionicons name="finger-print-outline" size={20} color={colors.icon} />
          <View style={styles.cardRowContent}>
            <Text style={[styles.cardLabel, { color: colors.icon }]}>ID</Text>
            <Text
              style={[styles.cardValue, { color: colors.text, fontSize: 12 }]}
              numberOfLines={1}
            >
              {user?.id || "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.signOutButton, { borderColor: "#FF3B30" }]}
        onPress={handleSignOut}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        <Text style={styles.signOutText}>{t("profile.signOut")}</Text>
      </TouchableOpacity>
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
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
    gap: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  cardRowContent: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  signOutText: {
    color: "#FF3B30",
    fontSize: 17,
    fontWeight: "600",
  },
});
