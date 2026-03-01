import { useLocalization } from "@/contexts/LocalizationContext";
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const SearchHeader = memo(
  ({
    activeTab,
    searchQuery,
    setSearchQuery,
    isDark,
    colors,
    remoteFromCache,
    localFromCache,
    onFilterPress,
  }: any) => {
    const { t } = useLocalization();
    return (
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("home.title")}
        </Text>

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5",
              borderColor: isDark ? "#3A3A3A" : "#E0E0E0",
            },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={colors.icon}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={
              activeTab === "local" ? t("home.search") : t("home.searchRemote")
            }
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={colors.icon} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={{ marginLeft: 8 }} onPress={onFilterPress}>
            <Ionicons name="options-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {((activeTab === "remote" && remoteFromCache) ||
          (activeTab === "local" && localFromCache)) && (
          <View
            style={[
              styles.cacheNotice,
              { backgroundColor: isDark ? "#2A1500" : "#FFF3E0" },
            ]}
          >
            <Ionicons name="cloud-offline-outline" size={14} color="#FF9800" />
            <Text style={styles.cacheNoticeText}>{t("network.cached")}</Text>
          </View>
        )}
      </View>
    );
  }
);

SearchHeader.displayName = "SearchHeader";

const styles = StyleSheet.create({
  header: {
    padding: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  cacheNotice: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  cacheNoticeText: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "500",
  },
});
