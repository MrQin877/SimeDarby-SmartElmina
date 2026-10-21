import { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { MessageSquarePlus } from "lucide-react-native";
import {
  CloseButton,
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
import { useStore } from "../state/store";
import type { DiscussionPost } from "../lib/model";

export function CreatePostModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data, update } = useStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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
      likes: 1,
      commentsCount: 0,
      isLiked: true,
      badgeLabel: "New Topic",
    };

    update((d) => ({
      ...d,
      discussions: [newPost, ...d.discussions],
    }));

    setTitle("");
    setContent("");
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Surface style={[s.modalCard, ui.shadow]}>
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

            <Action
              label="Post to Community Forum"
              disabled={!title.trim() || !content.trim()}
              onPress={handleSubmit}
            />
          </View>
        </Surface>
      </View>
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
    maxWidth: 380,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
