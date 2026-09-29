import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Clock, Download, Info, Monitor, Moon, RotateCcw, Send, Shield, Sun, Timer, Zap } from "lucide-react";
import { Toaster } from "sonner";
import { Chatbot } from "../components/Chatbot";
import { supabase } from "../../lib/supabase";
import { GlassSendTab } from "./GlassSendTab";
import { GlassRetrieveTab } from "./GlassRetrieveTab";
import { GlassHistoryTab } from "./GlassHistoryTab";
import { GlassAboutTab } from "./GlassAboutTab";
import type { GlassTheme, Tab } from "./types";

type ConnStatus = "checking" | "online" | "degraded" | "offline";

const STATUS_META: Record<ConnStatus, { label: string; color: string; bg: string; border: string }> = {
  checking: { label: "CHECKING", color: "#eab308", bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.25)" },
  online: { label: "SECURE", color: "#22c55e", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.22)" },
  degraded: { label: "DEGRADED", color: "#eab308", bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.25)" },
  offline: { label: "OFFLINE", color: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)" },
};

const tabs: { id: Tab; label: string; icon: typeof Send }[] = [
  { id: "send", label: "Send", icon: Send },
  { id: "retrieve", label: "Retrieve", icon: Download },
  { id: "history", label: "History", icon: Clock },
  { id: "about", label: "About", icon: Info },
];

const HERO: Record<Tab, { eyebrow: string; title: string; sub: string }> = {
  send: {
    eyebrow: "INSTANT TRANSFER",
    title: "Send Anything.",
    sub: "Text, code, or files — warped to any device with a single code.",
  },
  retrieve: {
    eyebrow: "CLOUD RETRIEVAL",
    title: "Open the Portal.",
    sub: "Enter your 6-digit code to pull content from the cloud instantly.",
  },
  history: {
    eyebrow: "LOCAL LOG",
    title: "Your Trail.",
    sub: "Recent transfers on this device. Cloud data self-destructs in 24h.",
  },
  about: {
    eyebrow: "DIGITAL GHOST",
    title: "Built to Forget.",
    sub: "Anonymous, ephemeral, cross-device. Zero accounts required.",
  },
};

export function GlassApp({
  theme,
  resolvedTheme,
  onThemeChange,
  onSwitchToClassic,
}: {
  theme: GlassTheme;
  resolvedTheme: "light" | "dark";
  onThemeChange: (theme: GlassTheme) => void;
  onSwitchToClassic: () => void;
}) {
  const [tab, setTab] = useState<Tab>("send");
  const [prefill, setPrefill] = useState<string | undefined>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState<ConnStatus>("checking");

  useEffect(() => {
    let alive = true;
    const check = async () => {
      if (!navigator.onLine) {
        if (alive) setStatus("offline");
        return;
      }
      const started = performance.now();
      try {
        const { error } = await supabase.from("clips").select("code", { head: true, count: "exact" }).limit(1);
        if (!alive) return;
        if (error) {
          setStatus("degraded");
          return;
        }
        setStatus(performance.now() - started > 1500 ? "degraded" : "online");
      } catch {
        if (alive) setStatus("offline");
      }
    };
    void check();
    const interval = window.setInterval(check, 30_000);
    const online = () => void check();
    const offline = () => setStatus("offline");
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      alive = false;
      window.clearInterval(interval);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("code") || params.get("retrieve");
    if (!raw) return;
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (clean.length === 6) {
      setPrefill(clean);
      setTab("retrieve");
    }
    params.delete("code");
    params.delete("retrieve");
    const nextUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "") + window.location.hash;
    window.history.replaceState({}, "", nextUrl);
  }, []);

  const handleTabChange = (next: Tab) => {
    setTab(next);
    if (next !== "retrieve") setPrefill(undefined);
  };

  const hero = HERO[tab];
  const statusMeta = STATUS_META[status];

  return (
    <div className="cc-glass-app cc-glass-classic-layout" data-resolved-theme={resolvedTheme}>
      <GlassBackground />
      <Toaster position="top-right" richColors />

      <header className="cc-classiclike-header">
        <button className="cc-classiclike-brand" onClick={() => handleTabChange("send")}>
          <img src="/logo.png" alt="CopyCloud" />
          <span>Copy<span>Cloud</span></span>
        </button>

        <nav className="cc-classiclike-top-tabs" aria-label="CopyCloud sections">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button key={item.id} className={active ? "active" : ""} onClick={() => handleTabChange(item.id)}>
                <Icon size={13} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="cc-classiclike-actions">
          <span
            className="cc-status-pill"
            title={`Connection: ${statusMeta.label.toLowerCase()}`}
            style={{ background: statusMeta.bg, borderColor: statusMeta.border, color: statusMeta.color }}
          >
            <i style={{ background: statusMeta.color, boxShadow: `0 0 7px ${statusMeta.color}` }} />
            {statusMeta.label}
          </span>
          <span className="cc-wipe-pill"><Timer size={11} />24H WIPE</span>
          <div className="cc-settings-wrap">
            <button className="cc-round-button" onClick={() => setSettingsOpen((value) => !value)} aria-expanded={settingsOpen} aria-label="Appearance settings">
              {resolvedTheme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            {settingsOpen && (
              <div className="cc-settings-popover">
                <span className="cc-popover-title">Appearance</span>
                <ThemeChoice icon={Monitor} label="System" active={theme === "system"} onClick={() => onThemeChange("system")} />
                <ThemeChoice icon={Sun} label="Light" active={theme === "light"} onClick={() => onThemeChange("light")} />
                <ThemeChoice icon={Moon} label="Dark" active={theme === "dark"} onClick={() => onThemeChange("dark")} />
                <div className="cc-popover-divider" />
                <button className="cc-popover-row" onClick={onSwitchToClassic}><RotateCcw size={15} /><span>Use Classic theme</span></button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="cc-classiclike-main">
        <section className="cc-classiclike-hero">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="cc-classiclike-eyebrow"><i />{hero.eyebrow}<i /></div>
              <h1>{hero.title}</h1>
              <p>{hero.sub}</p>
              <div className="cc-classiclike-trust">
                <span><Shield size={11} /> Anonymous</span>
                <span><Timer size={11} /> Wipe-on-24</span>
                <span><Zap size={11} /> Cross-platform</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        <section className="cc-classiclike-workspace-wrap">
          <div className="cc-classiclike-workspace">
            <div className="cc-workspace-tabs cc-workspace-tabs-classic">
              {tabs.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button key={item.id} className={active ? "active" : ""} onClick={() => handleTabChange(item.id)}>
                    <Icon size={13} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {tab === "send" && <motion.div key="send" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}><GlassSendTab /></motion.div>}
              {tab === "retrieve" && <motion.div key="retrieve" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}><GlassRetrieveTab prefillCode={prefill} /></motion.div>}
              {tab === "history" && <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}><GlassHistoryTab onRetrieve={(code) => { setPrefill(code); setTab("retrieve"); }} /></motion.div>}
              {tab === "about" && <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}><GlassAboutTab /></motion.div>}
            </AnimatePresence>
          </div>
          <div className="cc-classiclike-card-glow" />
        </section>
      </main>

      <footer className="cc-classiclike-footer">
        © 2026 Copy Cloud · Anonymous Ephemeral Transfer · No accounts · No tracking
      </footer>

      <Chatbot />
    </div>
  );
}

function ThemeChoice({ icon: Icon, label, active, onClick }: { icon: typeof Sun; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`cc-popover-row ${active ? "active" : ""}`} onClick={onClick}>
      <Icon size={15} />
      <span>{label}</span>
      {active && <Check size={14} />}
    </button>
  );
}

function GlassBackground() {
  return (
    <div className="cc-classiclike-background" aria-hidden>
      <div className="cc-light-grid cc-light-grid-top" />
      <div className="cc-light-grid cc-light-grid-floor" />
      <div className="cc-light-orb cc-light-orb-a" />
      <div className="cc-light-orb cc-light-orb-b" />
      <div className="cc-light-orb cc-light-orb-c" />
      <div className="cc-light-ring cc-light-ring-a" />
      <div className="cc-light-ring cc-light-ring-b" />
      <div className="cc-light-dots cc-light-dots-a" />
      <div className="cc-light-dots cc-light-dots-b" />
      <span className="cc-light-fragment frag-a">6F3X9A</span>
      <span className="cc-light-fragment frag-b">WIPE://24H</span>
      <span className="cc-light-fragment frag-c">TX:OK</span>
      <span className="cc-light-fragment frag-d">AES</span>
      <div className="cc-light-vignette" />
    </div>
  );
}
