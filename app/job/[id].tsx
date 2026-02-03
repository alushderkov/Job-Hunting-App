import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Colors } from "@/constants/theme";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useTheme } from "@/contexts/ThemeContext";
import jobService from "@/services/jobService";
import { Job } from "@/types/job";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function JobDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id as string;

  const { colorScheme } = useTheme();
  const { t } = useLocalization();
  const colors = Colors[colorScheme || "light"];

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadJob = useCallback(async () => {
    try {
      setIsLoading(true);
      const jobData = await jobService.getJobById(jobId);
      setJob(jobData);
    } catch (error) {
      console.error("Error loading job:", error);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleSaveToggle = async () => {
    if (!job) return;

    try {
      if (job.isSaved) {
        await jobService.unsaveJob(job.id);
      } else {
        await jobService.saveJob(job.id);
      }
      await loadJob();
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const handleEdit = () => {
    router.push(`/edit-job/${jobId}`);
  };

  const handleDelete = () => {
    Alert.alert(t("common.delete"), t("message.deleteConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await jobService.deleteJob(jobId);
            router.back();
          } catch (error) {
            console.error("Error deleting job:", error);
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!job) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Job not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colorScheme === "dark" ? "#2A2A2A" : "#E5E5E5",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Ionicons name="create-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveToggle}
            style={styles.headerButton}
          >
            <Ionicons
              name={job.isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={job.isSaved ? "#FFD700" : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={[styles.jobTitle, { color: colors.text }]}>
            {job.title}
          </Text>
          <Text style={[styles.company, { color: colors.icon }]}>
            {job.company}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={colors.tint} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {job.location}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color={colors.tint} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {job.salary}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={colors.tint} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {formatDate(job.postedDate)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("job.description")}
          </Text>
          <Text style={[styles.sectionContent, { color: colors.text }]}>
            {job.description}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("job.requirements")}
          </Text>
          <Text style={[styles.sectionContent, { color: colors.text }]}>
            {job.requirements}
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colorScheme === "dark" ? "#2A2A2A" : "#E5E5E5",
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: colors.tint }]}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>{t("job.apply")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    padding: 20,
  },
  jobTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  company: {
    fontSize: 18,
    fontWeight: "600",
  },
  infoSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    borderTopWidth: 1,
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
});
