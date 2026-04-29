import * as ImagePicker from "expo-image-picker";

export const receiptService = {
  async pickReceipt() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Media library permission is required to upload receipts.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.35,
      base64: true,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0];
  },
  async uploadReceipt(asset?: { uri: string; base64?: string | null }) {
    if (!asset) {
      return undefined;
    }

    if (asset.base64) {
      return `data:image/jpeg;base64,${asset.base64}`;
    }

    return asset.uri;
  },
};
