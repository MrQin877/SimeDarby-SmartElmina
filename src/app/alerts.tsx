import { useState } from "react";
import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import {
  AlertTriangle,
  Bus,
  Car,
  CheckCheck,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  Wrench,
} from "lucide-react-native";
import {
  Badge,
  Button,
  Card,
  Description,
  FilterChip,
  Page,
  PressableFeedback,
  Surface,
  Typography,
} from "../components/Common";
import { colors, fonts, radius, ui } from "../lib/theme";
import { useStore } from "../state/store";
import { initialAlerts } from "../lib/data";
import type { AlertItem } from "../lib/model";

export default function AlertsScreen() {
  const { data, update } = useStore();
  const [filter, setFilter] = useState<"all" | "unread" | "important">("all");

  const alerts = initialAlerts.map((item) => {
    const isRead = data.readAlerts.includes(item.id) || item.isRead;
    const isAcknowledged = data.acknowledgedAlerts.includes(item.id);
    return {
      ...item,
      isRead,
      isAcknowledged,
    };
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const filteredAlerts = alerts.filter((item) => {
    if (filter === "unread") return !item.isRead;
    if (filter === "important") return item.isImportant;
    return true;
  });

  const handleAcknowledge = (id: string) => {
    update((d) => ({
      ...d,
      acknowledgedAlerts: d.acknowledgedAlerts.includes(id)
        ? d.acknowledgedAlerts
        : [...d.acknowledgedAlerts, id],
      readAlerts: d.readAlerts.includes(id)
        ? d.readAlerts
        : [...d.readAlerts, id],
    }));
  };

  const handleMarkAllRead = () => {
    const allIds = initialAlerts.map((a) => a.id);
    update((d) => ({
      ...d,
      readAlerts: Array.from(new Set([...d.readAlerts, ...allIds])),
    }));
  };

  const getAlertIcon = (type: AlertItem["type"]) => {
    switch (type) {
      case "urgent":
        return AlertTriangle;
      case "mobility":
        return Car;
      case "shuttle":
        return Bus;
      case "official":
        return ShieldCheck;
      case "social":
        return MessageSquare;
      default:
        return Wrench;
    }
  };

  return (
    <Page
      title="Alerts"
      subtitle="Real-time township, mobility & safety updates."
      back
      right={
        unreadCount > 0 ? (
          <PressableFeedback
            onPress={handleMarkAllRead}
            style={[ui.row, { gap: 4, paddingVertical: 6, paddingHorizontal: 10 }]}
          >
            <CheckCheck size={16} color={colors.red} />
            <Typography
              style={{
                fontSize: 12,
                fontFamily: fonts.bold,
                fontWeight: "700",
                color: colors.red,
              }}
            >
              Mark all read
            </Typography>
          </PressableFeedback>
        ) : null
      }
    >
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        <FilterChip
          label={`All (${alerts.length})`}
          selected={filter === "all"}
          activeColor={colors.red}
          onPress={() => setFilter("all")}
        />
        <FilterChip
          label={`Unread (${unreadCount})`}
          selected={filter === "unread"}
          activeColor={colors.red}
          onPress={() => setFilter("unread")}
        />
        <FilterChip
          label={`Important (${alerts.filter((a) => a.isImportant).length})`}
          selected={filter === "important"}
          activeColor={colors.red}
          onPress={() => setFilter("important")}
        />
      </ScrollView>

      {/* Alerts Feed */}
      <View style={{ gap: 14 }}>
        {filteredAlerts.map((item) => {
          const Icon = getAlertIcon(item.type);
          const isUrgent = item.type === "urgent";

          return (
            <Card
              key={item.id}
              style={{
                padding: 16,
                gap: 12,
                borderColor: isUrgent ? colors.red : item.isRead ? colors.border : colors.ink,
                borderWidth: isUrgent ? 1.5 : item.isRead ? 1 : 1.2,
                backgroundColor: isUrgent ? colors.redSoft : colors.white,
              }}
            >
              <View style={ui.between}>
                <View style={[ui.row, { gap: 8 }]}>
                  <Surface
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: radius.md,
                      backgroundColor: isUrgent ? colors.red : colors.surfaceSecondary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={17} color={isUrgent ? colors.white : colors.ink} />
                  </Surface>
                  <Badge tone={isUrgent ? "red" : item.type === "mobility" ? "amber" : "neutral"}>
                    {item.badgeLabel}
                  </Badge>
                </View>

                <View style={[ui.row, { gap: 6 }]}>
                  <Typography style={{ fontSize: 11, color: colors.muted }}>
                    {item.timestamp}
                  </Typography>
                  {!item.isRead && (
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: colors.red,
                      }}
                    />
                  )}
                </View>
              </View>

              <View style={{ gap: 3 }}>
                <Typography.Heading
                  type="h3"
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: isUrgent ? colors.red : colors.ink,
                  }}
                >
                  {item.title}
                </Typography.Heading>
                <Description style={ui.muted}>{item.subtitle}</Description>
              </View>

              {item.content ? (
                <Typography style={[ui.body, { fontSize: 13, lineHeight: 19 }]}>
                  {item.content}
                </Typography>
              ) : null}

              {item.quote ? (
                <Surface
                  variant="secondary"
                  style={{
                    padding: 12,
                    borderRadius: radius.card,
                    backgroundColor: colors.surfaceSecondary,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Typography
                    style={{
                      fontSize: 13,
                      fontStyle: "italic",
                      color: colors.ink,
                      lineHeight: 18,
                    }}
                  >
                    {item.quote}
                  </Typography>
                </Surface>
              ) : null}

              {/* Action Buttons */}
              <View style={{ paddingTop: 4 }}>
                {item.type === "urgent" && (
                  <Button
                    variant={item.isAcknowledged ? "secondary" : "primary"}
                    onPress={() => handleAcknowledge(item.id)}
                    isDisabled={item.isAcknowledged}
                    style={{
                      height: 44,
                      borderRadius: radius.md,
                      backgroundColor: item.isAcknowledged ? colors.greenSoft : colors.red,
                      borderWidth: item.isAcknowledged ? 1 : 0,
                      borderColor: colors.green,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      style={{
                        fontFamily: fonts.bold,
                        fontSize: 13,
                        fontWeight: "700",
                        color: item.isAcknowledged ? colors.green : colors.white,
                      }}
                    >
                      {item.isAcknowledged ? "Acknowledged" : "Tap to Acknowledge"}
                    </Typography>
                  </Button>
                )}

                {item.type === "mobility" && (
                  <Button
                    variant="secondary"
                    onPress={() => router.push("/(tabs)/explore?sheet=traffic_details")}
                    style={{
                      height: 42,
                      borderRadius: radius.md,
                      backgroundColor: colors.surfaceSecondary,
                      borderWidth: 1,
                      borderColor: colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Car size={16} color={colors.ink} />
                    <Typography style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.ink }}>
                      View Traffic & Detour on Map
                    </Typography>
                    <ChevronRight size={16} color={colors.muted} />
                  </Button>
                )}

                {item.type === "shuttle" && (
                  <Button
                    variant="secondary"
                    onPress={() => router.push("/(tabs)/explore?sheet=shuttle")}
                    style={{
                      height: 42,
                      borderRadius: radius.md,
                      backgroundColor: colors.surfaceSecondary,
                      borderWidth: 1,
                      borderColor: colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Bus size={16} color={colors.ink} />
                    <Typography style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.ink }}>
                      Check Bus S1 Schedule
                    </Typography>
                    <ChevronRight size={16} color={colors.muted} />
                  </Button>
                )}

                {item.type === "official" && (
                  <Button
                    variant={item.isAcknowledged ? "secondary" : "secondary"}
                    onPress={() => handleAcknowledge(item.id)}
                    style={{
                      height: 42,
                      borderRadius: radius.md,
                      backgroundColor: item.isAcknowledged ? colors.greenSoft : colors.surfaceSecondary,
                      borderWidth: 1,
                      borderColor: item.isAcknowledged ? colors.green : colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      style={{
                        fontFamily: fonts.bold,
                        fontSize: 13,
                        color: item.isAcknowledged ? colors.green : colors.ink,
                      }}
                    >
                      {item.isAcknowledged ? "Notice Acknowledged" : "Acknowledge Notice"}
                    </Typography>
                  </Button>
                )}

                {item.type === "social" && (
                  <Button
                    variant="secondary"
                    onPress={() => router.push("/(tabs)/community?tab=forum")}
                    style={{
                      height: 42,
                      borderRadius: radius.md,
                      backgroundColor: colors.surfaceSecondary,
                      borderWidth: 1,
                      borderColor: colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <MessageSquare size={16} color={colors.ink} />
                    <Typography style={{ fontFamily: fonts.bold, fontSize: 13, color: colors.ink }}>
                      Open Forum Discussion
                    </Typography>
                    <ChevronRight size={16} color={colors.muted} />
                  </Button>
                )}
              </View>
            </Card>
          );
        })}

        {filteredAlerts.length === 0 && (
          <Surface
            style={{
              padding: 28,
              borderRadius: radius.card,
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCheck size={28} color={colors.green} />
            <Typography style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.ink }}>
              All caught up!
            </Typography>
            <Description style={ui.muted}>
              No unread notifications at this moment.
            </Description>
          </Surface>
        )}
      </View>
    </Page>
  );
}
