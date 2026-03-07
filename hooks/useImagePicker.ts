import { useLocalization } from "@/contexts/LocalizationContext";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export function useImagePicker() {
  const { t } = useLocalization();

  const pickFromGallery = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("common.error"),
        "Permission to access gallery is required."
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const takePhoto = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("common.error"),
        "Permission to access camera is required."
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const showImageOptions = (): Promise<string | null> => {
    return new Promise((resolve) => {
      Alert.alert(t("camera.title"), undefined, [
        {
          text: t("camera.gallery"),
          onPress: async () => {
            const uri = await pickFromGallery();
            resolve(uri);
          },
        },
        {
          text: t("camera.take"),
          onPress: async () => {
            const uri = await takePhoto();
            resolve(uri);
          },
        },
        {
          text: t("camera.cancel"),
          style: "cancel",
          onPress: () => resolve(null),
        },
      ]);
    });
  };

  return { pickFromGallery, takePhoto, showImageOptions };
}
