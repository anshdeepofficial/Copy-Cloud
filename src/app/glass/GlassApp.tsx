import { useEffect, useState } from "react";
import { Check, Download, History, Info, Monitor, Moon, RotateCcw, Send, Sun } from "lucide-react";
import { Toaster } from "sonner";
import { GlassSendTab } from "./GlassSendTab";
import { GlassRetrieveTab } from "./GlassRetrieveTab";
import { GlassHistoryTab } from "./GlassHistoryTab";
import { GlassAboutTab } from "./GlassAboutTab";
import type { GlassTheme, Tab } from "./types";

const tabs: { id: Tab; label: string; icon: typeof Send }[] = [
  { id: "send", label: "Send", icon: Send },
  { id: "retrieve", label: "Retrieve", icon: Download },
  { id: "history", label: "History", icon: History },
  { id: "about", label: "About", icon: Info },
];

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("code") || params.get("retrieve");
    if (!raw) return;
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (clean.length === 6) {
      setPrefill(clean);
      setTab("retrieve");
    }
  }, []);

  const openHistoryCode = (code: string) => {
    setPrefill(code);
    setTab("retrieve");
  };

  return (
    <div className="cc-glass-app" data-resolved-theme={resolvedTheme}>
      <Toaster position="top-center" richColors />
      <div className="cc-glass-ambient cc-glass-ambient-a" />
      <div className="cc-glass-ambient cc-glass-ambient-b" />

      <header className="cc-glass-header">
        <button className="cc-brand-button" onClick={() => setTab("send")}>
          <img src="/logo.png" alt="CopyCloud" />
          <span>CopyCloud</span>
        </button>

        <nav className="cc-glass-nav" aria-label="CopyCloud sections">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="cc-glass-actions">
          <span className="cc-live-pill"><i /> Secure</span>
          <div className="cc-settings-wrap">
            <button className="cc-round-button" onClick={() => setSettingsOpen((v) => !v)} aria-expanded={settingsOpen}>
              {resolvedTheme === "dark" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            {settingsOpen && (
              <div className="cc-settings-popover">
                <span className="cc-popover-title">Appearance</span>
                <ThemeChoice icon={Monitor} label="System" active={theme === "system"} onClick={() => onThemeChange("system")} />
                <ThemeChoice icon={Sun} label="Light" active={theme === "light"} onClick={() => onThemeChange("light")} />
                <ThemeChoice icon={Moon} label="Dark" active={theme === "dark"} onClick={() => onThemeChange("dark")} />
                <div className="cc-popover-divider" />
                <button className="cc-popover-row" onClick={onSwitchToClassic}><RotateCcw size={15} /><span>Switch to Classic UI</span></button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="cc-glass-main">
        <section className="cc-glass-hero">
          <span className="cc-step-chip">{tab === "send" ? "1" : tab === "retrieve" ? "2" : tab === "history" ? "3" : "4"}</span>
          <h1>{tab === "send" ? "Send without friction." : tab === "retrieve" ? "Retrieve in seconds." : tab === "history" ? "Recent activity." : "Simple by design."}</h1>
          <p>{tab === "send" ? "Move text and files between devices with a short code — no account needed." : tab === "retrieve" ? "Enter the six-character code from the sending device and pull your content instantly." : tab === "history" ? "Your recent transfers stay on this device while cloud content automatically expires." : "CopyCloud keeps cross-device transfer focused, temporary and easy to understand."}</p>
        </section>

        <section className="cc-glass-workspace">
          <div className="cc-workspace-tabs">
            {tabs.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
                  <Icon size={15} /> {item.label}
                </button>
              );
            })}
          </div>

          {tab === "send" && <GlassSendTab />}
          {tab === "retrieve" && <GlassRetrieveTab prefillCode={prefill} />}
          {tab === "history" && <GlassHistoryTab onRetrieve={openHistoryCode} />}
          {tab === "about" && <GlassAboutTab />}
        </section>
      </main>

      <footer className="cc-glass-footer">
        <span>© 2026 CopyCloud</span>
        <span>Anonymous transfer · 24-hour expiry · No account required</span>
      </footer>
    </div>
  );
}

function ThemeChoice({ icon: Icon, label, active, onClick }: { icon: typeof Sun; label: string; active: boolean; onClick: () => void }) {
  return <button className={`cc-popover-row ${active ? "active" : ""}`} onClick={onClick}><Icon size={15} /><span>{label}</span>{active && <Check size={14} />}</button>;
}
