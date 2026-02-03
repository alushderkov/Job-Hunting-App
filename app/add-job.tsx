import { Colors } from "@/constants/theme";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useTheme } from "@/contexts/ThemeContext";
import jobService from "@/services/jobService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddJobScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { t } = useLocalization();
  const colors = Colors[colorScheme || "light"];

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
    requirements: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert(t("common.error"), "Please enter a job title");
      return false;
    }
    if (!formData.company.trim()) {
      Alert.alert(t("common.error"), "Please enter a company name");
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert(t("common.error"), "Please enter a job description");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      await jobService.createJob({
        ...formData,
        postedDate: new Date().toISOString(),
      });
      router.back();
    } catch (error) {
      console.error("Error creating job:", error);
      Alert.alert(t("common.error"), "Failed to create job");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (Object.values(formData).some((value) => value.trim())) {
      Alert.alert(
        t("common.cancel"),
        "Are you sure you want to discard this job?",
        [
          { text: "No", style: "cancel" },
          { text: "Yes", onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const InputField = ({
    label,
    placeholder,
    value,
    onChangeText,
    multiline = false,
    numberOfLines = 1,
  }: {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
    numberOfLines?: number;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          {
            backgroundColor: colorScheme === "dark" ? "#1E1E1E" : "#F5F5F5",
            color: colors.text,
            borderColor: colorScheme === "dark" ? "#2A2A2A" : "#E0E0E0",
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colorScheme === "dark" ? "#2A2A2A" : "#E5E5E5",
          },
        ]}
      >
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("addJob.title")}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={isSaving}
        >
          <Text style={[styles.saveText, { color: colors.tint }]}>
            {isSaving ? t("common.loading") : t("common.save")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <InputField
          label={t("addJob.jobTitle")}
          placeholder={t("addJob.titlePlaceholder")}
          value={formData.title}
          onChangeText={(text) => handleInputChange("title", text)}
        />

        <InputField
          label={t("addJob.company")}
          placeholder={t("addJob.companyPlaceholder")}
          value={formData.company}
          onChangeText={(text) => handleInputChange("company", text)}
        />

        <InputField
          label={t("addJob.location")}
          placeholder={t("addJob.locationPlaceholder")}
          value={formData.location}
          onChangeText={(text) => handleInputChange("location", text)}
        />

        <InputField
          label={t("addJob.salary")}
          placeholder={t("addJob.salaryPlaceholder")}
          value={formData.salary}
          onChangeText={(text) => handleInputChange("salary", text)}
        />

        <InputField
          label={t("addJob.description")}
          placeholder={t("addJob.descriptionPlaceholder")}
          value={formData.description}
          onChangeText={(text) => handleInputChange("description", text)}
          multiline
          numberOfLines={6}
        />

        <InputField
          label={t("addJob.requirements")}
          placeholder={t("addJob.requirementsPlaceholder")}
          value={formData.requirements}
          onChangeText={(text) => handleInputChange("requirements", text)}
          multiline
          numberOfLines={6}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerButton: {
    padding: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
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
