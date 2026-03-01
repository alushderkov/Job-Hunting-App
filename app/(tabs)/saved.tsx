import { EmptyState } from "@/components/EmptyState";
import { JobCard } from "@/components/JobCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Colors } from "@/constants/theme";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSavedJobsViewModel } from "@/viewmodels/SavedJobsViewModel";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SavedJobsScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { t } = useLocalization();
  const colors = Colors[colorScheme || "light"];

  // ViewModel handles all business logic
  const {
    savedJobs,
    isLoading,
    isRefreshing,
    isFromCache,
    handleUnsave,
    handleRefresh,
    reload,
  } = useSavedJobsViewModel();

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t("saved.title")}
      </Text>
      {savedJobs.length > 0 && (
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          {savedJobs.length}{" "}
          {savedJobs.length === 1
            ? t("job.savedCount")
            : t("job.savedCountPlural")}
        </Text>
      )}
    </View>
  );

  const renderCacheNotice = () => {
    if (!isFromCache) return null;
    return (
      <View
        style={[
          styles.cacheNotice,
          { backgroundColor: colorScheme === "dark" ? "#2A1500" : "#FFF3E0" },
        ]}
      >
        <Ionicons name="cloud-offline-outline" size={14} color="#FF9800" />
        <Text style={styles.cacheNoticeText}>{t("network.cached")}</Text>
      </View>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={savedJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => router.push(`/job/${item.id}`)}
            onSaveToggle={() => handleUnsave(item)}
          />
        )}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderCacheNotice()}
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            title={t("saved.noJobs")}
            message={t("saved.empty")}
          />
        }
        contentContainerStyle={
          savedJobs.length === 0 ? styles.emptyList : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  emptyList: {
    flex: 1,
  },
  cacheNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
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
