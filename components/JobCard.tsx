import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { Job } from "@/types/job";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface JobCardProps {
  job: Job;
  onPress: () => void;
  onSaveToggle?: () => void;
  showSaveButton?: boolean;
}

export function JobCard({
  job,
  onPress,
  onSaveToggle,
  showSaveButton = true,
}: JobCardProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme || "light"];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#FFFFFF",
          borderColor: colorScheme === "dark" ? "#2A2A2A" : "#E5E5E5",
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text
            style={[styles.jobTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {job.title}
          </Text>
          <Text
            style={[styles.company, { color: colors.icon }]}
            numberOfLines={1}
          >
            {job.company}
          </Text>
        </View>
        {showSaveButton && onSaveToggle && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onSaveToggle();
            }}
            style={styles.saveButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={job.isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={job.isSaved ? "#FFD700" : colors.icon}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={colors.icon} />
          <Text
            style={[styles.detailText, { color: colors.icon }]}
            numberOfLines={1}
          >
            {job.location}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color={colors.icon} />
          <Text
            style={[styles.detailText, { color: colors.icon }]}
            numberOfLines={1}
          >
            {job.salary}
          </Text>
        </View>
      </View>

      <Text
        style={[styles.description, { color: colors.text }]}
        numberOfLines={2}
      >
        {job.description}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={[styles.postedDate, { color: colors.icon }]}>
          {formatDate(job.postedDate)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    fontWeight: "500",
  },
  saveButton: {
    padding: 4,
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postedDate: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
