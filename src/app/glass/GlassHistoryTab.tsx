import { useEffect, useState } from "react";
import { toast } from "sonner";
import { clearHistoryStore, getHistory, type HistoryItem } from "../../lib/supabase";
import {
  GlassClockIcon,
  GlassInboxIcon,
  GlassRetrieveIcon,
  GlassSendIcon,
  GlassTrashIcon,
} from "./GlassIcons";

function timeAgo(ts: number) {
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

export function GlassHistoryTab({ onRetrieve }: { onRetrieve: (code: string) => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  useEffect(() => setHistory(getHistory()), []);

  const clear = () => {
    clearHistoryStore();
    setHistory([]);
    toast.success("History cleared");
  };

  if (history.length === 0) {
    return (
      <div className="cc-glass-panel cc-classic-content-panel">
        <div className="cc-classic-empty-history">
          <div><GlassInboxIcon size={24} /></div>
          <strong>No activity yet</strong>
          <p>Your recent sends and retrievals will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-glass-panel cc-classic-content-panel">
      <div className="cc-classic-history-head">
        <p>RECENT — {history.length} ENTRIES</p>
        <button onClick={clear}><GlassTrashIcon size={15} /> Clear</button>
      </div>
      <div className="cc-classic-history-list">
        {history.map((item, index) => (
          <button key={`${item.code}-${index}`} onClick={() => onRetrieve(item.code)}>
            <span className={`cc-classic-history-icon ${item.action}`}>
              {item.action === "send" ? <GlassSendIcon size={17} /> : <GlassRetrieveIcon size={17} />}
            </span>
            <span className="cc-classic-history-main">
              <span><b>{item.code}</b><em>{item.action}</em></span>
              <small>{item.preview}</small>
            </span>
            <span className="cc-classic-history-time"><GlassClockIcon size={14} /> {timeAgo(item.ts)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
