import type { PlaceRecord } from "@/lib/place-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Cloud,
  Hotel,
  Landmark,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  SquareParking,
  Trash2,
  X,
} from "@wso2/oxygen-ui-icons-react";
import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events · Agent Testing Workspace" },
      {
        name: "description",
        content:
          "Browse and create venue risk evaluations, organized as cards.",
      },
    ],
  }),
  component: EventsPage,
});

type PlacesResponse = { places: PlaceRecord[] };

type PlaceGroup = {
  key: string;
  displayName: string;
  venueAddress: string;
  /** Ascending by event date, per the user's request to order the stack by date. */
  places: PlaceRecord[];
};

const RISK_COLOR: Record<string, "success" | "warning" | "error" | "default"> =
  {
    low: "success",
    moderate: "warning",
    high: "error",
    severe: "error",
  };

// Deterministic, offline gradient palette used for card banners — no external
// image requests, and the same venue always gets the same look.
const GRADIENTS: Array<[string, string]> = [
  ["#6366f1", "#a855f7"],
  ["#0ea5e9", "#22d3ee"],
  ["#f59e0b", "#ef4444"],
  ["#10b981", "#3b82f6"],
  ["#ec4899", "#f43f5e"],
  ["#8b5cf6", "#6366f1"],
  ["#14b8a6", "#06b6d4"],
  ["#f97316", "#ec4899"],
];

function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const [from, to] = GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

function dateSortValue(eventDate: string): number {
  const parsed = Date.parse(eventDate);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function groupPlaces(places: PlaceRecord[]): PlaceGroup[] {
  const groups = new Map<string, PlaceGroup>();

  for (const place of places) {
    const displayName = place.report?.venue_name || place.venueAddress;
    const key = displayName.trim().toLowerCase();
    const existing = groups.get(key);
    if (existing) {
      existing.places.push(place);
    } else {
      groups.set(key, {
        key,
        displayName,
        venueAddress: place.venueAddress,
        places: [place],
      });
    }
  }

  for (const group of groups.values()) {
    group.places.sort(
      (a, b) => dateSortValue(a.eventDate) - dateSortValue(b.eventDate),
    );
  }

  // Newest activity (by its most recent evaluation) surfaces first.
  return Array.from(groups.values()).sort((a, b) => {
    const aLatest = dateSortValue(a.places[a.places.length - 1].eventDate);
    const bLatest = dateSortValue(b.places[b.places.length - 1].eventDate);
    return bLatest - aLatest;
  });
}

function EventsPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [venueAddress, setVenueAddress] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["places"],
    queryFn: async (): Promise<PlacesResponse> => {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error(`Failed to load places (${res.status})`);
      return res.json();
    },
    refetchInterval: (query) =>
      query.state.data?.places.some((p) => p.status === "pending")
        ? 2000
        : false,
  });

  const createMutation = useMutation({
    mutationFn: async (input: { venueAddress: string; eventDate: string }) => {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok && res.status !== 200) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed (${res.status})`);
      }
      return res.json() as Promise<{ place: PlaceRecord }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      setFormOpen(false);
      setVenueAddress("");
      setEventDate("");
      setEventTime("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Failed to delete (${res.status})`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });

  function submitNewPlace(e: React.FormEvent) {
    e.preventDefault();
    if (!venueAddress.trim() || !eventDate.trim()) return;
    const combinedDate = eventTime.trim()
      ? `${eventDate.trim()} ${eventTime.trim()}`
      : eventDate.trim();
    createMutation.mutate({
      venueAddress: venueAddress.trim(),
      eventDate: combinedDate,
    });
  }

  const places = useMemo(() => data?.places ?? [], [data]);
  const groups = useMemo(() => groupPlaces(places), [places]);

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groups;
    return groups.filter(
      (g) =>
        g.displayName.toLowerCase().includes(term) ||
        g.venueAddress.toLowerCase().includes(term),
    );
  }, [groups, search]);

  const selectedGroup = groups.find((g) => g.key === selectedGroupKey) ?? null;

  return (
    <Box sx={{ height: "100%", overflowY: "auto", p: { xs: 2, md: 3 } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2, maxWidth: "72rem", mx: "auto" }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Venues evaluated by the agent, organized as cards.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setFormOpen(true)}
          sx={{
            background: "linear-gradient(90deg, #ff5e3a 0%, #ff2a6d 100%)",
            color: "white",
          }}
        >
          New Place
        </Button>
      </Stack>

      <Box sx={{ maxWidth: "72rem", mx: "auto" }}>
        {places.length > 0 && (
          <TextField
            placeholder="Search by venue name or address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            }}
          />
        )}

        {isLoading && (
          <Stack alignItems="center" sx={{ mt: 8 }}>
            <CircularProgress size={28} />
          </Stack>
        )}

        {isError && <Alert severity="error">Failed to load events.</Alert>}

        {!isLoading && !isError && places.length === 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              borderStyle: "dashed",
            }}
          >
            <MapPin size={32} style={{ opacity: 0.5, marginBottom: 12 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              No places evaluated yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ask the agent to assess a venue in Chat, or create one here
              directly.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Plus size={16} />}
              onClick={() => setFormOpen(true)}
            >
              New Place
            </Button>
          </Paper>
        )}

        {!isLoading &&
          !isError &&
          places.length > 0 &&
          filteredGroups.length === 0 && (
            <Alert severity="info">No places match "{search}".</Alert>
          )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 2.5,
          }}
        >
          {filteredGroups.map((group) => (
            <PlaceGroupCard
              key={group.key}
              group={group}
              onOpen={() => setSelectedGroupKey(group.key)}
            />
          ))}
        </Box>
      </Box>

      {/* New Place dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={submitNewPlace}>
          <DialogTitle>Evaluate a new place</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="Venue name / address"
                placeholder="Pelican Hill Resort, Newport Beach"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                fullWidth
                autoFocus
                required
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Event date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
                <TextField
                  label="Event time (optional)"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
              {createMutation.isError && (
                <Alert severity="error">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : "Failed to evaluate this place."}
                </Alert>
              )}
              {createMutation.isPending && (
                <Alert severity="info" icon={<CircularProgress size={16} />}>
                  Calling the agent to evaluate this venue — this can take up to
                  a minute…
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setFormOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createMutation.isPending ||
                !venueAddress.trim() ||
                !eventDate.trim()
              }
            >
              {createMutation.isPending ? "Evaluating…" : "Evaluate"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Group detail dialog — every evaluation for this venue, oldest to newest */}
      <Dialog
        open={Boolean(selectedGroup)}
        onClose={() => setSelectedGroupKey(null)}
        fullWidth
        maxWidth="md"
      >
        {selectedGroup && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{selectedGroup.displayName}</span>
              <IconButton
                onClick={() => setSelectedGroupKey(null)}
                size="small"
              >
                <X size={18} />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={1.5}>
                {selectedGroup.places.map((place) => (
                  <Accordion
                    key={place.id}
                    variant="outlined"
                    defaultExpanded={selectedGroup.places.length === 1}
                    disableGutters
                  >
                    <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ width: "100%", pr: 1 }}
                      >
                        <Calendar size={14} />
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{ flex: 1 }}
                        >
                          {place.eventDate}
                        </Typography>
                        {place.status === "ready" &&
                          place.report?.overall_risk_level && (
                            <Chip
                              size="small"
                              label={place.report.overall_risk_level}
                              color={
                                RISK_COLOR[
                                  place.report.overall_risk_level.toLowerCase()
                                ] ?? "default"
                              }
                              sx={{ textTransform: "capitalize" }}
                            />
                          )}
                        {place.status === "pending" && (
                          <CircularProgress size={16} />
                        )}
                        {place.status === "error" && (
                          <AlertTriangle
                            size={16}
                            color="var(--mui-palette-error-main, #d32f2f)"
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(place.id);
                          }}
                          disabled={
                            deleteMutation.isPending &&
                            deleteMutation.variables === place.id
                          }
                        >
                          {deleteMutation.isPending &&
                          deleteMutation.variables === place.id ? (
                            <CircularProgress size={14} />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </IconButton>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <PlaceDetails place={place} />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}

function PlaceGroupCard({
  group,
  onOpen,
}: {
  group: PlaceGroup;
  onOpen: () => void;
}) {
  const latest = group.places[group.places.length - 1];
  const stackDepth = Math.min(group.places.length - 1, 2);
  const banner = gradientFor(group.key);
  const riskLevel = latest.report?.overall_risk_level?.toLowerCase();

  return (
    <Box sx={{ position: "relative" }}>
      {Array.from({ length: stackDepth }).map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            inset: 0,
            top: (i + 1) * 6,
            left: (i + 1) * 6,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            zIndex: 0,
            opacity: 1 - (i + 1) * 0.25,
          }}
        />
      ))}

      <Card
        variant="outlined"
        sx={{
          position: "relative",
          zIndex: 1,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          cursor: "pointer",
          transition: "box-shadow 0.15s ease, transform 0.15s ease",
          "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
        }}
        onClick={onOpen}
      >
        <Box
          sx={{
            position: "relative",
            height: 92,
            background: banner,
            display: "flex",
            alignItems: "flex-end",
            p: 1.5,
            overflow: "hidden",
          }}
        >
          <Landmark
            size={72}
            style={{
              position: "absolute",
              top: -12,
              right: -12,
              opacity: 0.18,
              color: "white",
            }}
          />
          {group.places.length > 1 && (
            <Chip
              size="small"
              label={`${group.places.length} evaluations`}
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                bgcolor: "rgba(0,0,0,0.35)",
                color: "white",
                fontWeight: 600,
              }}
            />
          )}
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{
              color: "white",
              textShadow: "0 1px 3px rgba(0,0,0,0.45)",
              lineHeight: 1.2,
            }}
          >
            {group.displayName}
          </Typography>
        </Box>

        <CardContent
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            color="text.secondary"
          >
            <Calendar size={14} />
            <Typography variant="caption">
              Latest: {latest.eventDate}
            </Typography>
          </Stack>

          {latest.status === "pending" && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={14} />
              <Typography variant="caption" color="text.secondary">
                Evaluating…
              </Typography>
            </Stack>
          )}

          {latest.status === "error" && (
            <Alert
              severity="error"
              sx={{ mt: 0.5 }}
              icon={<AlertTriangle size={16} />}
            >
              {latest.errorMessage || "Evaluation failed."}
            </Alert>
          )}

          {latest.status === "ready" && (
            <>
              {riskLevel && (
                <Chip
                  size="small"
                  label={`${riskLevel} risk`}
                  color={RISK_COLOR[riskLevel] ?? "default"}
                  sx={{ alignSelf: "flex-start", textTransform: "capitalize" }}
                />
              )}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {latest.report?.executive_summary}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

function PlaceDetails({ place }: { place: PlaceRecord }) {
  const report = place.report;
  const weatherSummary = (place.weatherData?.summary ?? null) as Record<
    string,
    unknown
  > | null;
  const hotels = (place.mapsData?.hotels ?? []) as Array<
    Record<string, unknown>
  >;
  const parking = (place.mapsData?.parking ?? null) as Record<
    string,
    unknown
  > | null;

  if (place.status !== "ready" || !report) {
    return (
      <Typography variant="body2" color="text.secondary">
        {place.status === "error" ? place.errorMessage : "Still evaluating…"}
      </Typography>
    );
  }

  return (
    <Stack spacing={3}>
      <Section title="Executive Summary" icon={<ShieldAlert size={16} />}>
        <Typography variant="body2">{report.executive_summary}</Typography>
      </Section>

      <Section title="Weather Risk" icon={<Cloud size={16} />}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {report.weather_risk?.summary}
        </Typography>
        <BulletList items={report.weather_risk?.points} />
        {weatherSummary && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            {String(weatherSummary.temp_c ?? "")}°C ·{" "}
            {String(weatherSummary.humidity_pct ?? "")}% humidity ·{" "}
            {Array.isArray(weatherSummary.conditions) &&
            weatherSummary.conditions[0]
              ? String(
                  (weatherSummary.conditions[0] as Record<string, unknown>)
                    .description ?? "",
                )
              : ""}
          </Typography>
        )}
      </Section>

      <Section title="Venue & Logistics" icon={<Hotel size={16} />}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {report.venue_logistics?.summary}
        </Typography>
        <BulletList items={report.venue_logistics?.points} />
        {hotels.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography
              variant="caption"
              fontWeight="bold"
              color="text.secondary"
            >
              Nearby hotels
            </Typography>
            <BulletList
              items={hotels.map((h) => `${h.name ?? ""} — ${h.distance ?? ""}`)}
            />
          </Box>
        )}
        {parking?.summary ? (
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            sx={{ mt: 1.5 }}
          >
            <SquareParking size={14} style={{ marginTop: 2, flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary">
              {String(parking.summary)}
            </Typography>
          </Stack>
        ) : null}
      </Section>

      <Section
        title="Critical Failure Points"
        icon={<AlertTriangle size={16} />}
      >
        <BulletList items={report.critical_failure_points} />
      </Section>

      <Section title="Contingency Plan">
        <BulletList items={report.contingency_plan} />
      </Section>

      <Section title="Weather Windows">
        <BulletList items={report.weather_windows} />
      </Section>
    </Stack>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        {icon}
        <Typography variant="subtitle2" fontWeight="bold">
          {title}
        </Typography>
      </Stack>
      <Divider sx={{ mb: 1.5 }} />
      {children}
    </Box>
  );
}

function BulletList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
      {items.map((item, i) => (
        <Typography component="li" variant="body2" key={i} sx={{ mb: 0.5 }}>
          {item}
        </Typography>
      ))}
    </Box>
  );
}
