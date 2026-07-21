import { useSettings } from "@/lib/settings-context";
import { createFileRoute } from "@tanstack/react-router";
import { Check, RotateCcw, Eye, EyeOff } from "@wso2/oxygen-ui-icons-react";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Stack,
  Alert,
  IconButton,
  InputAdornment,
} from "@wso2/oxygen-ui";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Agent Testing Workspace" },
      {
        name: "description",
        content: "Configure your agent API endpoint, key, and request header.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { apiUrl, apiKey, apiHeader, updateSettings, reset, defaults } = useSettings();
  const [url, setUrl] = useState(apiUrl);
  const [key, setKey] = useState(apiKey);
  const [header, setHeader] = useState(apiHeader);
  const [saved, setSaved] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  type SavedSettings = {
    apiUrl: string;
    apiKey: string;
    apiHeader: string;
  };

  useEffect(() => {
    setUrl(apiUrl);
    setKey(apiKey);
    setHeader(apiHeader);
  }, [apiUrl, apiKey, apiHeader]);

  async function save(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError(null);

    const nextSettings = {
      apiUrl: url.trim() || defaults.apiUrl,
      apiKey: key.trim(),
      apiHeader: header.trim() || defaults.apiHeader,
    };

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextSettings),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as { settings?: SavedSettings };
      const savedSettings = data.settings ?? nextSettings;

      updateSettings(savedSettings);
      setUrl(savedSettings.apiUrl);
      setKey(savedSettings.apiKey);
      setHeader(savedSettings.apiHeader);
      setRestarting(true);
      setTimeout(() => {
        setRestarting(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }, 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ height: "100%", overflowY: "auto", py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Override the agent endpoint, API key, and request header name. Values are saved to the
          local .env file and take precedence over any runtime defaults.
        </Typography>

        <form onSubmit={save}>
          <Card variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <TextField
                  label="Agent URL"
                  helperText={`Default: ${defaults.apiUrl}`}
                  id="api-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-agent.example.com/v1/chat"
                  fullWidth
                />
                
                <TextField
                  label="API Key"
                  helperText="Sent using the request header name below. If the header is Authorization, it becomes 'Bearer <key>'."
                  id="api-key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="sk-..."
                  type={showKey ? "text" : "password"}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle api key visibility"
                          onClick={() => setShowKey(!showKey)}
                          edge="end"
                        >
                          {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Request Header Name"
                  helperText={`Default: ${defaults.apiHeader}. Common values: Authorization, X-API-Key.`}
                  id="api-header"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  placeholder="X-API-Key"
                  fullWidth
                />

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Outgoing request header preview
                  </Typography>
                  <Typography variant="caption" fontFamily="monospace">
                    {header.trim() || defaults.apiHeader || "Authorization"}:{" "}
                    {key.trim()
                      ? header.trim().toLowerCase() === "authorization"
                        ? `Bearer ${key.trim()}`
                        : key.trim()
                      : "(enter an API key)"}
                  </Typography>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saved ? <Check /> : null}
                    sx={{
                      background: "linear-gradient(90deg, #ff5e3a 0%, #ff2a6d 100%)",
                      color: "white",
                      "&:disabled": {
                        opacity: 0.7,
                      },
                    }}
                  >
                    {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    disabled={saving}
                    startIcon={<RotateCcw />}
                    onClick={async () => {
                      setSaving(true);
                      setError(null);
                      try {
                        const response = await fetch("/api/settings", { method: "DELETE" });
                        if (!response.ok) {
                          throw new Error(await response.text());
                        }

                        const data = (await response.json()) as { settings?: SavedSettings };
                        const resetSettings = data.settings ?? {
                          apiUrl: defaults.apiUrl,
                          apiKey: defaults.apiKey,
                          apiHeader: defaults.apiHeader,
                        };

                        reset();
                        updateSettings(resetSettings);
                        setUrl(resetSettings.apiUrl);
                        setKey(resetSettings.apiKey);
                        setHeader(resetSettings.apiHeader);
                        setRestarting(true);
                        setTimeout(() => {
                          setRestarting(false);
                          setSaved(true);
                          setTimeout(() => setSaved(false), 1500);
                        }, 3000);
                      } catch (resetError) {
                        setError(
                          resetError instanceof Error ? resetError.message : "Failed to reset settings",
                        );
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    Reset to defaults
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </form>

        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "action.hover" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Local .env values
            </Typography>
            <Typography variant="body2" component="div" fontFamily="monospace" color="text.secondary">
              <div>AGENT_URL = {defaults.apiUrl || "(unset)"}</div>
              <div>AGENT_API_KEY = {defaults.apiKey ? "••••••" : "(unset)"}</div>
              <div>AGENT_API_HEADER = {defaults.apiHeader || "(unset)"}</div>
            </Typography>
          </CardContent>
        </Card>
      </Container>

      {restarting && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              border: "4px solid rgba(255, 94, 58, 0.2)",
              borderTop: "4px solid #ff5e3a",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              mb: 3,
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
          <Typography variant="h6" fontWeight="bold" sx={{ color: "white" }}>
            Restarting application...
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", mt: 1 }}>
            Applying settings and reloading backend services.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
