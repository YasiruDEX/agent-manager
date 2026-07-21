import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutGrid,
  MessageSquare,
  Settings as SettingsIcon,
  Sparkles,
} from "@wso2/oxygen-ui-icons-react";
import type { ReactNode } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Stack,
  IconButton,
} from "@wso2/oxygen-ui";

type NavItem = {
  to: "/" | "/events" | "/settings";
  label: string;
  icon: ReactNode;
};

const NAV: NavItem[] = [
  { to: "/", label: "Chat", icon: <MessageSquare size={24} /> },
  { to: "/events", label: "Events", icon: <LayoutGrid size={24} /> },
  { to: "/settings", label: "Settings", icon: <SettingsIcon size={24} /> },
];

export function AppShell() {
  const location = useLocation();

  return (
    <Box
      sx={{
        display: "flex",
        h: "100vh",
        w: "100vw",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* Sidebar for Desktop */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          width: 260,
          flexShrink: 0,
          flexDirection: "column",
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            h: 64,
            height: 64,
            px: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <img
            src="/favicon.svg"
            alt="Agent Manager Logo"
            width={32}
            height={32}
          />
          <Box>
            <Typography variant="body2" fontWeight="bold" noWrap>
              Agent Testing
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              validation dashboard
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ flex: 1, py: 2, px: 1 }}>
          <List>
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);
              return (
                <ListItem key={item.to} disablePadding>
                  <Link
                    to={item.to}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      width: "100%",
                    }}
                  >
                    <ListItemButton
                      selected={active}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        "&.Mui-selected": {
                          bgcolor: "action.selected",
                          color: "primary.main",
                          "&:hover": {
                            bgcolor: "action.selected",
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: active ? "primary.main" : "text.secondary",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: active ? "bold" : "medium",
                        }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Divider />
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            © 2026 WSO2
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{ display: "flex", flex: 1, flexDirection: "column", minWidth: 0 }}
      >
        {/* Header */}
        <Box
          component="header"
          sx={{
            display: "flex",
            h: 64,
            height: 64,
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, md: 3 },
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          {/* Mobile view brand header */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ display: { md: "none" } }}
          >
            <img
              src="/favicon.svg"
              alt="Agent Manager Logo"
              width={28}
              height={28}
            />
            <Typography variant="body2" fontWeight="bold">
              Agent Tester
            </Typography>
          </Stack>

          {/* Desktop page title */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {location.pathname === "/settings"
              ? "Settings"
              : location.pathname.startsWith("/events")
                ? "Events"
                : "Chat"}
          </Typography>

          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "secondary.main",
              color: "secondary.contrastText",
              fontSize: "0.875rem",
              fontWeight: "bold",
            }}
          >
            A
          </Avatar>
        </Box>

        {/* Main page view */}
        <Box
          component="main"
          sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}
        >
          <Outlet />
        </Box>

        {/* Mobile Navigation bar */}
        <Box
          component="nav"
          sx={{
            display: { xs: "flex", md: "none" },
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "8px 0 6px",
                  textDecoration: "none",
                  color: active ? "primary.main" : "text.secondary",
                }}
              >
                <IconButton
                  color={active ? "primary" : "default"}
                  size="small"
                  disableRipple
                >
                  {item.icon}
                </IconButton>
                <Typography
                  variant="caption"
                  sx={{ fontSize: "10px", mt: 0.25 }}
                >
                  {item.label}
                </Typography>
              </Link>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
