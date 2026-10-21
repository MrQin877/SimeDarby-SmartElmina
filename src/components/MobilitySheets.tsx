import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  AlertTriangle,
  Car,
  Clock,
  Compass,
  RotateCcw,
  Accessibility,
  ShieldCheck,
  Check,
} from "lucide-react-native";
import {
  Badge,
  Button,
  Card,
  Description,
  IconButton,
  PressableFeedback,
  Surface,
  Typography,
} from "./Common";
import Action from "./Action";
import { colors, fonts, radius, ui } from "../lib/theme";
import { useStore } from "../state/store";
import { hourlyTrafficData, shuttleStops } from "../lib/data";

/**
 * 1. Traffic Details Sheet Content
 */
export function TrafficDetailsContent({
  onPlanJourney,
  onClose,
}: {
  onPlanJourney: () => void;
  onClose: () => void;
}) {
  const [selectedHour, setSelectedHour] = useState("8 AM");

  return (
    <View style={{ gap: 14 }}>
      {/* Header Info */}
      <View style={ui.between}>
        <View style={{ gap: 2 }}>
          <View style={[ui.row, { gap: 6 }]}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: colors.green,
              }}
            />
            <Typography
              style={{
                fontSize: 11,
                fontFamily: fonts.bold,
                fontWeight: "700",
                color: colors.green,
                letterSpacing: 0.8,
              }}
            >
              LIVE SENSOR ACTIVE · SEC-3502-A
            </Typography>
          </View>
          <Typography.Heading type="h2" style={ui.heading}>
            Demo Junction A — GCE Interchange 3502
          </Typography.Heading>
          <Description style={ui.muted}>
            Persiaran Atmosfera merge corridor
          </Description>
        </View>
      </View>

      {/* Prominent Congestion Alert Banner */}
      <Surface
        style={{
          backgroundColor: colors.redSoft,
          borderRadius: radius.card,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.red,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <Surface
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.md,
            backgroundColor: colors.red,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangle size={20} color={colors.white} />
        </Surface>
        <View style={{ flex: 1, gap: 2 }}>
          <Typography
            style={{
              fontFamily: fonts.bold,
              fontSize: 15,
              fontWeight: "700",
              color: colors.red,
            }}
          >
            Heavy Congestion — 12 min Delay
          </Typography>
          <Typography
            style={{
              fontFamily: fonts.medium,
              fontSize: 12,
              color: colors.ink,
              lineHeight: 17,
            }}
          >
            Level 4 Corridor Saturation • Severe merge tailback towards toll exit.
          </Typography>
        </View>
      </Surface>

      {/* AI Resident Advisory */}
      <Surface
        variant="secondary"
        style={{
          padding: 14,
          borderRadius: radius.card,
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <Compass size={18} color={colors.red} style={{ marginTop: 2 }} />
        <View style={{ flex: 1, gap: 2 }}>
          <Typography
            style={{
              fontSize: 11,
              fontFamily: fonts.bold,
              fontWeight: "700",
              color: colors.red,
              letterSpacing: 0.5,
            }}
          >
            AI RESIDENT ADVISORY
          </Typography>
          <Typography
            style={{
              fontSize: 13,
              color: colors.ink,
              lineHeight: 18,
              fontFamily: fonts.medium,
            }}
          >
            Heavy volume merging into GCE Mainline. AI routing suggests taking{" "}
            <Typography style={{ fontWeight: "700", color: colors.red }}>
              Elmina West Bypass
            </Typography>{" "}
            to save approximately 9 minutes.
          </Typography>
        </View>
      </Surface>

      {/* Two Observation Metrics */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Surface
          style={{
            flex: 1,
            padding: 14,
            borderRadius: radius.card,
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 6,
          }}
        >
          <View style={[ui.row, { gap: 6 }]}>
            <Car size={15} color={colors.red} />
            <Description style={ui.muted}>Vehicle Flow</Description>
          </View>
          <View style={[ui.row, { alignItems: "baseline", gap: 4 }]}>
            <Typography style={{ fontSize: 24, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
              78
            </Typography>
            <Description style={ui.muted}>veh/min</Description>
          </View>
          <Badge tone="red">+124% normal avg</Badge>
        </Surface>

        <Surface
          style={{
            flex: 1,
            padding: 14,
            borderRadius: radius.card,
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 6,
          }}
        >
          <View style={[ui.row, { gap: 6 }]}>
            <Clock size={15} color={colors.red} />
            <Description style={ui.muted}>Queue Condition</Description>
          </View>
          <View style={[ui.row, { alignItems: "baseline", gap: 4 }]}>
            <Typography style={{ fontSize: 24, fontFamily: fonts.bold, fontWeight: "700", color: colors.red }}>
              450
            </Typography>
            <Description style={ui.muted}>meters</Description>
          </View>
          <Typography style={{ fontSize: 11, color: colors.muted }}>
            Slow crawl at 14 km/h
          </Typography>
        </Surface>
      </View>

      {/* Interactive Historical Traffic Trend Bar Chart */}
      <Card style={{ padding: 14, gap: 10 }}>
        <View style={ui.between}>
          <Typography style={{ fontFamily: fonts.bold, fontSize: 13, fontWeight: "700", color: colors.ink }}>
            Historical Traffic Trend
          </Typography>
          <View style={[ui.row, { gap: 12 }]}>
            <View style={[ui.row, { gap: 4 }]}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colors.border }} />
              <Typography style={{ fontSize: 10, color: colors.muted }}>Normal</Typography>
            </View>
            <View style={[ui.row, { gap: 4 }]}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colors.red }} />
              <Typography style={{ fontSize: 10, color: colors.red, fontWeight: "700" }}>Today</Typography>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "flex-end", height: 80, gap: 8, paddingTop: 10 }}>
          {hourlyTrafficData.map((item) => {
            const isSelected = selectedHour === item.hour;
            return (
              <PressableFeedback
                key={item.hour}
                onPress={() => setSelectedHour(item.hour)}
                style={{ flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 4 }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, width: "100%", justifyContent: "center" }}>
                  {/* Normal Bar */}
                  <View
                    style={{
                      width: 5,
                      height: (item.normal / 100) * 55,
                      backgroundColor: colors.border,
                      borderRadius: 2,
                    }}
                  />
                  {/* Today Bar */}
                  <View
                    style={{
                      width: item.isCurrent ? 7 : 5,
                      height: (item.today / 100) * 55,
                      backgroundColor: item.isCurrent ? colors.red : item.today > 50 ? colors.amber : colors.green,
                      borderRadius: 2,
                    }}
                  />
                </View>
                <Typography
                  style={{
                    fontSize: 9,
                    fontFamily: fonts.semibold,
                    fontWeight: isSelected ? "700" : "500",
                    color: item.isCurrent ? colors.red : colors.muted,
                  }}
                >
                  {item.hour.replace(" ", "")}
                </Typography>
              </PressableFeedback>
            );
          })}
        </View>
        <Typography style={{ fontSize: 11, color: colors.muted, textAlign: "center" }}>
          Current volume ({selectedHour}) is higher than typical weekday baseline.
        </Typography>
      </Card>

      {/* Verified Incident Notice */}
      <Surface
        variant="secondary"
        style={{
          padding: 12,
          borderRadius: radius.card,
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          gap: 10,
        }}
      >
        <ShieldCheck size={18} color={colors.amber} style={{ marginTop: 2 }} />
        <View style={{ flex: 1, gap: 2 }}>
          <Typography style={{ fontSize: 12, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
            Gate 3 Sensor Maintenance Active
          </Typography>
          <Description style={ui.muted}>
            Boom gate lane 1 bypass active. Sime Darby auxiliary police assisting flow.
          </Description>
        </View>
      </Surface>

      {/* Primary Action Button */}
      <Action label="Plan Alternative Journey" onPress={onPlanJourney} />
    </View>
  );
}

/**
 * 2. Plan Journey Sheet Content
 */
export function PlanJourneyContent({
  onSelectOption,
  onClose,
}: {
  onSelectOption: (optionId: string) => void;
  onClose: () => void;
}) {
  const { data, update } = useStore();
  const [origin, setOrigin] = useState("Elmina Green 1 (Jalan Casuarina)");
  const [destination, setDestination] = useState("Kwasa Damansara Transit Hub");
  const [isStepFree, setIsStepFree] = useState(true);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleToggleVanReservation = () => {
    if (data.isVanReserved) {
      update((d) => ({
        ...d,
        isVanReserved: false,
        vanSeatsRemaining: d.vanSeatsRemaining + 1,
      }));
    } else {
      update((d) => ({
        ...d,
        isVanReserved: true,
        vanSeatsRemaining: Math.max(0, d.vanSeatsRemaining - 1),
      }));
    }
  };

  return (
    <View style={{ gap: 14 }}>
      {/* Route Inputs Card */}
      <Surface
        style={{
          padding: 14,
          borderRadius: radius.card,
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 10,
        }}
      >
        <View style={[ui.row, { gap: 10 }]}>
          <View style={{ alignItems: "center", gap: 4, paddingVertical: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red }} />
            <View style={{ width: 1, height: 26, backgroundColor: colors.border }} />
            <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colors.ink }} />
          </View>

          <View style={{ flex: 1, gap: 8 }}>
            <View>
              <Typography style={{ fontSize: 10, fontFamily: fonts.bold, fontWeight: "700", color: colors.muted }}>
                ORIGIN (PRECINCT STOP)
              </Typography>
              <Typography style={{ fontSize: 14, fontFamily: fonts.semibold, fontWeight: "600", color: colors.ink }}>
                {origin}
              </Typography>
            </View>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <View>
              <Typography style={{ fontSize: 10, fontFamily: fonts.bold, fontWeight: "700", color: colors.muted }}>
                DESTINATION HUB
              </Typography>
              <Typography style={{ fontSize: 14, fontFamily: fonts.semibold, fontWeight: "600", color: colors.ink }}>
                {destination}
              </Typography>
            </View>
          </View>

          <IconButton
            icon={RotateCcw}
            label="Swap locations"
            onPress={handleSwap}
            style={{ width: 36, height: 36 }}
          />
        </View>

        {/* Step-Free Toggle & Depart Time */}
        <View style={[ui.between, { paddingTop: 6, borderTopWidth: 1, borderColor: colors.border }]}>
          <PressableFeedback
            onPress={() => setIsStepFree(!isStepFree)}
            style={[ui.row, { gap: 6 }]}
          >
            <Surface
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                backgroundColor: isStepFree ? colors.red : colors.white,
                borderWidth: 1,
                borderColor: isStepFree ? colors.red : colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isStepFree && <Check size={14} color={colors.white} strokeWidth={3} />}
            </Surface>
            <Accessibility size={15} color={colors.ink} />
            <Typography style={{ fontSize: 12, fontFamily: fonts.medium, color: colors.ink }}>
              Step-free routes
            </Typography>
          </PressableFeedback>

          <Badge tone="neutral">Morning Peak</Badge>
        </View>
      </Surface>

      {/* OPTION 1: Recommended EV Feeder Bus T102 */}
      <Card style={{ padding: 16, gap: 10, borderColor: colors.red, borderWidth: 1.5 }}>
        <View style={ui.between}>
          <Badge tone="red">FASTEST COMMUTE · DIRECT FEEDER</Badge>
          <Typography style={{ fontSize: 16, fontFamily: fonts.bold, fontWeight: "700", color: colors.red }}>
            RM 1.00
          </Typography>
        </View>

        <View style={ui.between}>
          <View style={{ gap: 2 }}>
            <Typography.Heading type="h3" style={{ fontSize: 16, fontWeight: "700", color: colors.ink }}>
              Smart EV Feeder T102
            </Typography.Heading>
            <Description style={ui.muted}>Direct connection to MRT Line 9</Description>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Typography style={{ fontSize: 18, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
              18 mins
            </Typography>
            <Description style={ui.muted}>6.8 km • Direct</Description>
          </View>
        </View>

        {/* Live Dispatch Badge */}
        <Surface
          variant="secondary"
          style={{
            padding: 10,
            borderRadius: radius.md,
            backgroundColor: colors.surfaceSecondary,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green }} />
          <Typography style={{ fontSize: 12, fontFamily: fonts.semibold, fontWeight: "600", color: colors.ink }}>
            Bus EV-04 arriving in 3 mins
          </Typography>
          <Typography style={{ fontSize: 11, color: colors.muted }}>· 42% seats free</Typography>
        </Surface>

        <Action
          label="Start Turn-by-Turn Guidance"
          onPress={() => router.push("/journey")}
        />
      </Card>

      {/* OPTION 2: Feeder T101 + MRT Rail */}
      <Card style={{ padding: 14, gap: 8 }}>
        <View style={ui.between}>
          <Badge tone="neutral">Option 2 · 1 Transfer</Badge>
          <Typography style={{ fontSize: 15, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
            RM 3.10
          </Typography>
        </View>
        <View style={ui.between}>
          <View style={{ gap: 2 }}>
            <Typography style={{ fontSize: 15, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
              Feeder T101 + MRT Rail
            </Typography>
            <Description style={ui.muted}>Kwasa Sentral platform interchange</Description>
          </View>
          <Typography style={{ fontSize: 16, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
            28 mins
          </Typography>
        </View>
      </Card>

      {/* OPTION 3: Township Commuter Van / Carpool */}
      <Card style={{ padding: 14, gap: 10 }}>
        <View style={ui.between}>
          <Badge tone="amber">COMMUTER CARPOOL VAN</Badge>
          <Typography style={{ fontSize: 15, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
            RM 4.00 <Typography style={{ fontSize: 11, color: colors.muted }}>/ seat</Typography>
          </Typography>
        </View>
        <View style={ui.between}>
          <View style={{ gap: 2 }}>
            <Typography style={{ fontSize: 15, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
              Elmina Murni Pool
            </Typography>
            <Description style={ui.muted}>
              {data.vanSeatsRemaining} seats remaining · Departs 08:30 AM
            </Description>
          </View>
          <Typography style={{ fontSize: 16, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
            16 mins
          </Typography>
        </View>

        <Button
          variant={data.isVanReserved ? "secondary" : "primary"}
          onPress={handleToggleVanReservation}
          style={{
            height: 44,
            borderRadius: radius.md,
            backgroundColor: data.isVanReserved ? colors.greenSoft : colors.red,
            borderWidth: data.isVanReserved ? 1 : 0,
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
              color: data.isVanReserved ? colors.green : colors.white,
            }}
          >
            {data.isVanReserved ? "Seat Confirmed · Tap to Cancel" : "Reserve Commuter Van Seat"}
          </Typography>
        </Button>
      </Card>
    </View>
  );
}

/**
 * 3. Shuttle Bus & Timetable Sheet Content
 */
export function ShuttleContent({
  onFocusBus,
  onClose: _onClose,
}: {
  onFocusBus: () => void;
  onClose: () => void;
}) {
  return (
    <View style={{ gap: 14 }}>
      {/* Route S1 Header Card */}
      <Card style={{ padding: 16, gap: 10, borderColor: colors.border }}>
        <View style={ui.between}>
          <Badge tone="red">ROUTE S1</Badge>
          <View style={[ui.row, { gap: 6 }]}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green }} />
            <Typography style={{ fontSize: 11, fontFamily: fonts.bold, fontWeight: "700", color: colors.green }}>
              LIVE BUS ACTIVE
            </Typography>
          </View>
        </View>

        <View style={{ gap: 2 }}>
          <Typography.Heading type="h2" style={ui.heading}>
            Valley & Central Park Circular
          </Typography.Heading>
          <Description style={ui.muted}>
            06:30 AM to 10:00 PM daily • Every 20 mins
          </Description>
        </View>

        {/* Next Departure Callout */}
        <Surface
          style={{
            padding: 12,
            borderRadius: radius.card,
            backgroundColor: colors.redSoft,
            borderWidth: 1,
            borderColor: colors.red,
            gap: 2,
          }}
        >
          <View style={ui.between}>
            <Typography style={{ fontSize: 11, fontFamily: fonts.bold, fontWeight: "700", color: colors.red }}>
              NEXT DEPARTURE
            </Typography>
            <Badge tone="red">BUS EV-01</Badge>
          </View>
          <View style={[ui.row, { alignItems: "baseline", gap: 6, marginTop: 4 }]}>
            <Typography style={{ fontSize: 24, fontFamily: fonts.bold, fontWeight: "700", color: colors.red }}>
              08:32 AM
            </Typography>
            <Typography style={{ fontSize: 13, fontFamily: fonts.semibold, color: colors.ink }}>
              (in 6 mins)
            </Typography>
          </View>
          <Description style={{ fontSize: 12, color: colors.ink }}>
            Departs from Central Park Pavilion (Bay 2)
          </Description>
        </Surface>

        {/* Accessibility Features */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          <Badge tone="neutral">Wheelchair Ramp</Badge>
          <Badge tone="neutral">Audio Announcements</Badge>
          <Badge tone="neutral">Low-Floor Entry</Badge>
        </View>

        <Action label="Track Bus EV-01 on Map" onPress={onFocusBus} />
      </Card>

      {/* Stop Route Preview Timeline */}
      <Card style={{ padding: 14, gap: 12 }}>
        <Typography style={{ fontFamily: fonts.bold, fontSize: 14, fontWeight: "700", color: colors.ink }}>
          Stop Sequence & Arrival Timeline
        </Typography>

        <View style={{ gap: 12 }}>
          {shuttleStops.map((stop, idx) => (
            <View key={stop.id} style={[ui.row, { alignItems: "flex-start", gap: 12 }]}>
              {/* Pin Indicator */}
              <View style={{ alignItems: "center", width: 20 }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: stop.isOrigin ? colors.red : stop.isTerminal ? colors.ink : colors.border,
                    borderWidth: 2,
                    borderColor: colors.white,
                  }}
                />
                {idx < shuttleStops.length - 1 && (
                  <View style={{ width: 1, height: 28, backgroundColor: colors.border, marginTop: 2 }} />
                )}
              </View>

              <View style={{ flex: 1, gap: 2 }}>
                <Typography style={{ fontSize: 13, fontFamily: fonts.semibold, fontWeight: "600", color: colors.ink }}>
                  {stop.name}
                </Typography>
                <Description style={ui.muted}>{stop.subtitle}</Description>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Typography style={{ fontSize: 12, fontFamily: fonts.bold, fontWeight: "700", color: colors.red }}>
                  {stop.time}
                </Typography>
                <Typography style={{ fontSize: 10, color: colors.muted }}>{stop.note}</Typography>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Following Trips */}
      <Surface
        variant="secondary"
        style={{
          padding: 12,
          borderRadius: radius.card,
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 6,
        }}
      >
        <Typography style={{ fontSize: 11, fontFamily: fonts.bold, fontWeight: "700", color: colors.muted }}>
          FOLLOWING DEPARTURES
        </Typography>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[
            { trip: "Trip 2", time: "08:52 AM" },
            { trip: "Trip 3", time: "09:12 AM" },
            { trip: "Trip 4", time: "09:32 AM" },
          ].map((t) => (
            <Surface
              key={t.trip}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: radius.md,
                backgroundColor: colors.white,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Typography style={{ fontSize: 10, color: colors.muted }}>{t.trip}</Typography>
              <Typography style={{ fontSize: 12, fontFamily: fonts.bold, fontWeight: "700", color: colors.ink }}>
                {t.time}
              </Typography>
            </Surface>
          ))}
        </View>
      </Surface>
    </View>
  );
}
