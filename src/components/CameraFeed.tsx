import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { View } from "react-native";
import { VideoOff } from "lucide-react-native";
import { Description, Surface, Typography } from "./Common";
import { ui, colors, radius } from "../lib/theme";
function LivePlayer({ url }: { url: string }) {
  const player = useVideoPlayer(url, (p) => {
    p.muted = true;
    p.play();
  });
  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });
  return (
    <View style={{ gap: 8 }}>
      <VideoView
        player={player}
        style={{ width: "100%", height: 190, borderRadius: radius.card }}
        nativeControls
        allowsFullscreen
      />
      <Description style={ui.muted}>
        {status === "error"
          ? "Feed unavailable. The camera may be offline."
          : status === "loading"
            ? "Connecting to camera…"
            : "Authorised stream · availability depends on the source"}
      </Description>
    </View>
  );
}
export default function CameraFeed({ url }: { url?: string }) {
  if (url && url.startsWith("https://")) return <LivePlayer url={url} />;
  return (
    <Surface
      variant="tertiary"
      style={{
        backgroundColor: colors.surfaceSecondary,
        minHeight: 150,
        borderRadius: radius.card,
        padding: 20,
        gap: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <VideoOff size={28} color={colors.muted} />
      <Typography style={{ fontWeight: "600", color: colors.ink }}>
        Camera feed not connected
      </Typography>
      <Description style={[ui.muted, { textAlign: "center" }]}>
        This is a sample camera location.{`\n`}An authorised live feed is
        required.
      </Description>
    </Surface>
  );
}
