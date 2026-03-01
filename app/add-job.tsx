import { InputField } from "@/components/InputField";
import { Colors } from "@/constants/theme";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useTheme } from "@/contexts/ThemeContext";
import jobService from "@/services/jobService";
import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

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
    imageUrl: "",
    jobType: "full-time",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const ext = uri.substring(uri.lastIndexOf(".") + 1);
      const fileName = `${uuidv4()}.${ext}`;

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: fileName,
        type: `image/${ext}`,
      } as any);

      const { error } = await supabase.storage
        .from("jobs")
        .upload(fileName, formData);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("jobs")
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);

      if (error?.message?.includes("row-level security policy")) {
        Alert.alert(
          "Storage Error",
          "Failed to upload because of Row-Level Security (RLS) policies. Please check your Supabase Storage policies for the 'jobs' bucket."
        );
      } else {
        Alert.alert(
          "Upload Error",
          "Failed to upload image. Please check your connection and Supabase settings."
        );
      }

      return null;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert(t("common.error"), t("validation.jobTitle"));
      return false;
    }
    if (!formData.company.trim()) {
      Alert.alert(t("common.error"), t("validation.company"));
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert(t("common.error"), t("validation.description"));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      let uploadedImageUrl = null;
      if (imageUri) {
        uploadedImageUrl = await uploadImage(imageUri);
      }

      await jobService.createJob({
        ...formData,
        imageUrl: uploadedImageUrl || undefined,
        postedDate: new Date().toISOString(),
      });
      router.back();
    } catch (error) {
      console.error("Error creating job:", error);
      Alert.alert(t("common.error"), t("error.createJob"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (Object.values(formData).some((value) => value.trim())) {
      Alert.alert(t("common.cancel"), t("discard.confirm"), [
        { text: t("common.no"), style: "cancel" },
        { text: t("common.yes"), onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

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
          colorScheme={colorScheme || "light"}
          textColor={colors.text}
          iconColor={colors.icon}
        />

        <InputField
          label={t("addJob.company")}
          placeholder={t("addJob.companyPlaceholder")}
          value={formData.company}
          onChangeText={(text) => handleInputChange("company", text)}
          colorScheme={colorScheme || "light"}
          textColor={colors.text}
          iconColor={colors.icon}
        />

        <InputField
          label={t("addJob.location")}
          placeholder={t("addJob.locationPlaceholder")}
          value={formData.location}
          onChangeText={(text) => handleInputChange("location", text)}
          colorScheme={colorScheme || "light"}
          textColor={colors.text}
          iconColor={colors.icon}
        />

        <InputField
          label={t("addJob.salary")}
          placeholder={t("addJob.salaryPlaceholder")}
          value={formData.salary}
          onChangeText={(text) => handleInputChange("salary", text)}
          colorScheme={colorScheme || "light"}
          textColor={colors.text}
          iconColor={colors.icon}
        />

        <InputField
          label={t("addJob.description")}
          placeholder={t("addJob.descriptionPlaceholder")}
          value={formData.description}
          onChangeText={(text) => handleInputChange("description", text)}
          colorScheme={colorScheme || "light"}
          textColor={colors.text}
          iconColor={colors.icon}
          multiline
          numberOfLines={6}
        />

        <View style={styles.jobTypeContainer}>
          <Text style={[styles.jobTypeLabel, { color: colors.text }]}>
            Type of Employment
          </Text>
          <View style={styles.jobTypeChips}>
            {["full-time", "part-time", "contract", "freelance"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.jobTypeChip,
                  {
                    borderColor: colorScheme === "dark" ? "#3A3A3A" : "#E0E0E0",
                  },
                  formData.jobType === type && {
                    backgroundColor: colors.tint,
                    borderColor: colors.tint,
                  },
                ]}
                onPress={() => handleInputChange("jobType", type)}
              >
                <Text
                  style={[
                    styles.jobTypeChipText,
                    {
                      color: formData.jobType === type ? "#fff" : colors.text,
                      textTransform: "capitalize",
                    },
                  ]}
                >
                  {type.replace("-", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <InputField
          label={t("addJob.requirements")}
          placeholder={t("addJob.requirementsPlaceholder")}
          value={formData.requirements}
          onChangeText={(text) => handleInputChange("requirements", text)}
          colorScheme={colorScheme || "light"}
          textColor={colors.text}
          iconColor={colors.icon}
          multiline
          numberOfLines={6}
        />

        <View style={styles.imagePickerContainer}>
          <TouchableOpacity
            style={[styles.imageButton, { borderColor: colors.tint }]}
            onPress={pickImage}
          >
            <Ionicons name="image-outline" size={24} color={colors.tint} />
            <Text style={[styles.imageButtonText, { color: colors.tint }]}>
              {imageUri ? "Change Image" : "Add Image"}
            </Text>
          </TouchableOpacity>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          )}
        </View>
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
  imagePickerContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
  },
  jobTypeContainer: {
    marginBottom: 20,
  },
  jobTypeLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  jobTypeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  jobTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  jobTypeChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
