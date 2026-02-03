import { EmptyState } from "@/components/EmptyState";
import { JobCard } from "@/components/JobCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Colors } from "@/constants/theme";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useTheme } from "@/contexts/ThemeContext";
import jobService from "@/services/jobService";
import { Job } from "@/types/job";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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

  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSavedJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const jobs = await jobService.getSavedJobs();
      setSavedJobs(jobs);
    } catch (error) {
      console.error("Error loading saved jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSavedJobs();
    }, [loadSavedJobs])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSavedJobs();
    setIsRefreshing(false);
  };

  const handleJobPress = (jobId: string) => {
    router.push(`/job/${jobId}`);
  };

  const handleUnsaveJob = async (job: Job) => {
    try {
      await jobService.unsaveJob(job.id);
      await loadSavedJobs();
    } catch (error) {
      console.error("Error unsaving job:", error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t("saved.title")}
      </Text>
      {savedJobs.length > 0 && (
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          {savedJobs.length} {savedJobs.length === 1 ? "job" : "jobs"} saved
        </Text>
      )}
    </View>
  );

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
            onPress={() => handleJobPress(item.id)}
            onSaveToggle={() => handleUnsaveJob(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
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
});
