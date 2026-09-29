import { useEffect, useMemo, useState } from "react";
import ClassicApp from "./App";
import { GlassApp } from "./glass/GlassApp";
import "../styles/glass.css";

type UiMode = "classic" | "glass";
type GlassTheme = "system" | "light" | "dark";

const UI_KEY = "cc_ui_version";
const THEME_KEY = "cc_glass_theme";

function readUiMode(): UiMode {
  const saved = localStorage.getItem(UI_KEY);
  return saved === "glass" ? "glass" : "classic";
}

function readTheme(): GlassTheme {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

export default function ExperienceRouter() {
  const [uiMode, setUiMode] = useState<UiMode>(() => readUiMode());
  const [glassTheme, setGlassTheme] = useState<GlassTheme>(() => readTheme());
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const update = () => setSystemDark(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const resolvedTheme = useMemo<"light" | "dark">(
    () => (glassTheme === "system" ? (systemDark ? "dark" : "light") : glassTheme),
    [glassTheme, systemDark]
  );

  useEffect(() => {
    document.body.classList.toggle("cc-glass-mode", uiMode === "glass");
    if (uiMode === "glass") {
      document.documentElement.dataset.ccTheme = resolvedTheme;
    } else {
      delete document.documentElement.dataset.ccTheme;
    }
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.content = uiMode === "glass"
        ? (resolvedTheme === "dark" ? "#07101d" : "#eef7ff")
        : "#030307";
    }
    return () => document.body.classList.remove("cc-glass-mode");
  }, [uiMode, resolvedTheme]);

  const selectUi = (next: UiMode) => {
    localStorage.setItem(UI_KEY, next);
    setUiMode(next);
  };

  const selectTheme = (next: GlassTheme) => {
    localStorage.setItem(THEME_KEY, next);
    setGlassTheme(next);
  };

  if (uiMode === "glass") {
    return (
      <GlassApp
        theme={glassTheme}
        resolvedTheme={resolvedTheme}
        onThemeChange={selectTheme}
        onSwitchToClassic={() => selectUi("classic")}
      />
    );
  }

  return <ClassicApp onSwitchToGlass={() => selectUi("glass")} />;
}
