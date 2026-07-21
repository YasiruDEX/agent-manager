import { Sparkles } from "lucide-react";

export function SplashScreen({ visible }: { visible: boolean }) {
  return (
    <div
      className={
        "pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 " +
        (visible ? "opacity-100" : "opacity-0")
      }
      aria-hidden={!visible}
    >
      <div className="relative flex flex-col items-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[0_0_36px_-16px_rgba(255,255,255,0.9)] backdrop-blur-sm animate-pulse">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <div className="mt-6 text-lg font-semibold tracking-tight text-foreground">
          Agent Testing Workspace
        </div>
        <div className="mt-3 flex gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/90" />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-white/90"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-white/90"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
