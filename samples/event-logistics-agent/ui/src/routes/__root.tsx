import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";

import appCss from "../styles.css?url";
import { SettingsProvider } from "../lib/settings-context";
import { AppShell } from "../components/app-shell";
import { SplashScreen } from "../components/splash-screen";
import { Toaster } from "../components/ui/sonner";
import { OxygenUIThemeProvider } from "@wso2/oxygen-ui";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back
          home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Agent Testing Workspace" },
        {
          name: "description",
          content:
            "Validate and chat with your AI agent in a focused, professional workspace.",
        },
        { name: "author", content: "WSO2" },
        { name: "application-name", content: "Agent Testing Workspace" },
        { name: "theme-color", content: "#0f172a" },
        { property: "og:title", content: "Agent Testing Workspace" },
        {
          property: "og:description",
          content:
            "Validate and chat with your AI agent in a focused, professional workspace.",
        },
        { property: "og:site_name", content: "Agent Testing Workspace" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: "Agent Testing Workspace" },
        {
          name: "twitter:description",
          content:
            "Validate and chat with your AI agent in a focused, professional workspace.",
        },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <OxygenUIThemeProvider>
          <SplashGate>
            <AppShell />
          </SplashGate>
          <Toaster position="top-right" richColors />
        </OxygenUIThemeProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

function SplashGate({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [mountSplash, setMountSplash] = useState(true);

  useEffect(() => {
    const hideTimer = setTimeout(() => setShowSplash(false), 1200);
    const unmountTimer = setTimeout(() => setMountSplash(false), 1800);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  return (
    <>
      {children}
      {mountSplash && <SplashScreen visible={showSplash} />}
    </>
  );
}
