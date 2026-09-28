import { useEffect, useMemo, useState } from "react";
import { Monitor, Moon, Sparkles, Sun } from "lucide-react";
import ClassicApp from "./App";
import { GlassApp } from "./glass/GlassApp";
import "../styles/glass.css";

type UiMode = "classic" | "glass";
type GlassTheme = "system" | "light" | "dark";

const UI_KEY = "cc_ui_version";
const THEME_KEY = "cc_glass_theme";

function readUiMode(): UiMode | null {
  const saved = localStorage.getItem(UI_KEY);
  return saved === "classic" || saved === "glass" ? saved : null;
}

function readTheme(): GlassTheme {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

export default function ExperienceRouter() {
  const [uiMode, setUiMode] = useState<UiMode | null>(() => readUiMode());
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

  if (!uiMode) {
    return <FirstVisitChooser onChoose={selectUi} />;
  }

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

  return (
    <div className="cc-classic-shell">
      <ClassicApp />
      <button className="cc-classic-switch" onClick={() => selectUi("glass")} aria-label="Switch to the new Glass interface">
        <Sparkles size={15} />
        Try Glass UI
      </button>
    </div>
  );
}

function FirstVisitChooser({ onChoose }: { onChoose: (mode: UiMode) => void }) {
  return (
    <div className="cc-chooser-page">
      <div className="cc-chooser-glow cc-chooser-glow-one" />
      <div className="cc-chooser-glow cc-chooser-glow-two" />
      <main className="cc-chooser-card" role="dialog" aria-modal="true" aria-labelledby="cc-choose-title">
        <div className="cc-chooser-brand">
          <img src="/logo.png" alt="" />
          <span>CopyCloud</span>
        </div>
        <span className="cc-kicker">YOUR INTERFACE, YOUR CHOICE</span>
        <h1 id="cc-choose-title">Choose your CopyCloud experience</h1>
        <p className="cc-chooser-copy">Both interfaces use the same real transfer system. You can switch again anytime.</p>

        <div className="cc-choice-grid">
          <button className="cc-choice-card cc-choice-classic" onClick={() => onChoose("classic")}>
            <div className="cc-choice-preview cc-choice-preview-dark">
              <div className="cc-mini-nav"><i /><i /><i /></div>
              <div className="cc-mini-hero" />
              <div className="cc-mini-panel"><span /><span /><span /></div>
            </div>
            <div className="cc-choice-copy">
              <div><strong>Classic</strong><small>Original CopyCloud</small></div>
              <span className="cc-choice-arrow">→</span>
            </div>
          </button>

          <button className="cc-choice-card cc-choice-glass" onClick={() => onChoose("glass")}>
            <div className="cc-choice-preview cc-choice-preview-light">
              <div className="cc-mini-glass-head" />
              <div className="cc-mini-upload-orb">↑</div>
              <div className="cc-mini-file-row"><span /><span /></div>
              <div className="cc-mini-action" />
            </div>
            <div className="cc-choice-copy">
              <div><strong>Glass</strong><small>New light + dark experience</small></div>
              <span className="cc-choice-new">NEW</span>
            </div>
          </button>
        </div>

        <div className="cc-chooser-themes" aria-hidden="true">
          <span><Sun size={14} /> Light</span>
          <span><Moon size={14} /> Dark</span>
          <span><Monitor size={14} /> System</span>
        </div>
      </main>
    </div>
  );
}
