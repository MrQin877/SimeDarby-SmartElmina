import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { MessageSquarePlus } from "lucide-react-native";
import { announcements } from "../../lib/data";
import { DemoNote, FilterChip, IconButton, Page } from "../../components/Common";
import AnnouncementCard from "../../components/AnnouncementCard";
import { colors } from "../../lib/theme";
export default function Community() {
  const [filter, setFilter] = useState("All");
  return (
    <Page
      title="Community"
      subtitle="The latest from your neighbourhood."
      right={
        <IconButton
          icon={MessageSquarePlus}
          color={colors.red}
          label="Report an issue"
          onPress={() => router.push("/report")}
        />
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {["All", "Roads", "Maintenance", "Community"].map((item) => (
          <FilterChip
            key={item}
            label={item}
            selected={item === filter}
            onPress={() => setFilter(item)}
          />
        ))}
      </ScrollView>
      <View style={{ gap: 18 }}>
        {announcements
          .filter((p) => filter === "All" || p.category === filter)
          .map((post) => (
            <AnnouncementCard key={post.id} post={post} />
          ))}
      </View>
      <DemoNote text="Demo feed · comments and reactions are saved on this device" />
    </Page>
  );
}
