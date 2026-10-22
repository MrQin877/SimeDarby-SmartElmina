import { useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, MessageSquarePlus } from "lucide-react-native";
import {
  CloseButton,
  Button,
  FilterChip,
  Input,
  Label,
  Surface,
  TextArea,
  TextField,
  Typography,
} from "./Common";
import Action from "./Action";
import { colors, fonts, radius, ui } from "../lib/theme";
import { useAppToast } from "../hooks/useAppToast";
import { useStore } from "../state/store";
import type { DiscussionPost } from "../lib/model";

export function CreatePostModal({
  isOpen,
  onClose,
  onPublished,
}: {
  isOpen: boolean;
  onClose: () => void;
  onPublished?: () => void;
}) {
  const { data, update } = useStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string>();
  const notify = useAppToast();
  const [pickingImage, setPickingImage] = useState(false);

  const attachImage = async () => {
    setPickingImage(Platform.OS !== "web");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7, allowsEditing: true });
      if (!result.canceled) setImageUri(result.assets[0].uri);
    } catch { notify("Unable to open your photos. Please try again.", "error"); }
    finally { setPickingImage(false); }
  };
  const [category, setCategory] = useState<DiscussionPost["category"]>("neighbourhood");

  if (!isOpen) return null;

  const categoryLabels: Record<DiscussionPost["category"], string> = {
    neighbourhood: "Neighbourhood",
    transport: "Transportation",
    events: "Events & Recreation",
    general: "General",
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    const newPost: DiscussionPost = {
      id: `disc-${Date.now()}`,
      authorName: data.fullName,
      authorInitials: data.fullName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      authorNeighborhood: data.precinct.split("—")[0].trim() || "Elmina Valley 3",
      timestamp: "Just now",
      category,
      categoryLabel: categoryLabels[category],
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUri,
      likes: 0,
      commentsCount: 0,
      isLiked: false,
      badgeLabel: "New Topic",
    };

    update((d) => ({
      ...d,
      discussions: [newPost, ...d.discussions],
    }));

    setTitle("");
    setContent("");
    setImageUri(undefined);
    setCategory("neighbourhood");
    onPublished?.();
    onClose();
    notify("Post published on this device.", "success");
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.overlay}>
        <Surface style={[s.modalCard, ui.shadow]}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
          <View style={ui.between}>
            <View style={[ui.row, { gap: 8 }]}>
              <Surface
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radius.md,
                  backgroundColor: colors.redSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MessageSquarePlus size={18} color={colors.red} />
              </Surface>
              <View>
                <Typography style={{ fontSize: 11, fontFamily: fonts.bold, fontWeight: "700", color: colors.red }}>
                  COMMUNITY FORUM
                </Typography>
                <Typography.Heading type="h3" style={{ fontSize: 16, fontWeight: "700", color: colors.ink }}>
                  New Discussion
                </Typography.Heading>
              </View>
            </View>

            <CloseButton accessibilityLabel="Close discussion modal" onPress={onClose} />
          </View>

          <View style={{ gap: 12 }}>
            <View style={{ gap: 6 }}>
              <Label>Category</Label>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {(["neighbourhood", "transport", "events", "general"] as const).map((cat) => (
                  <FilterChip
                    key={cat}
                    label={categoryLabels[cat]}
                    selected={category === cat}
                    activeColor={colors.red}
                    onPress={() => setCategory(cat)}
                  />
                ))}
              </View>
            </View>

            <TextField isRequired>
              <Label>Topic Title</Label>
              <Input
                style={ui.input}
                placeholder="What would you like to discuss?"
                value={title}
                onChangeText={setTitle}
                maxLength={90}
              />
            </TextField>

            <TextField isRequired>
              <Label>Details & Questions</Label>
              <TextArea
                accessibilityLabel="Topic details"
                style={[ui.input, { minHeight: 90, textAlignVertical: "top" }]}
                placeholder="Share context, location, or tips with fellow residents…"
                value={content}
                onChangeText={setContent}
                maxLength={600}
              />
            </TextField>

            {imageUri ? <View style={{ gap: 6 }}>
              <Image source={{ uri: imageUri }} style={{ width: "100%", height: 140, borderRadius: radius.card }} accessibilityLabel="Attached image preview" />
              <Button variant="secondary" onPress={() => setImageUri(undefined)} style={{ minHeight: 44 }}><Button.Label style={{ color: colors.red }}>Remove image</Button.Label></Button>
            </View> : <Button variant="secondary" isDisabled={pickingImage} onPress={() => { void attachImage(); }} style={{ minHeight: 44, gap: 8 }}><ImagePlus size={18} color={colors.red} /><Button.Label style={{ color: colors.red }}>{pickingImage ? "Opening photos…" : "Attach image"}</Button.Label></Button>}
            <Action
              label="Publish post"
              disabled={!title.trim() || !content.trim()}
              onPress={handleSubmit}
            />
          </View>
          </ScrollView>
        </Surface>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(9, 9, 11, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
