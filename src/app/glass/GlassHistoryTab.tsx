import { useState } from "react";
import { ChevronDown, Clock3, Download, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { clearHistoryStore, getHistory, type HistoryItem } from "../../lib/supabase";

export function GlassHistoryTab({ onRetrieve }: { onRetrieve: (code: string) => void }) {
  const [history, setHistory] = useState<HistoryItem[]>(() => getHistory());
  const clear = () => { clearHistoryStore(); setHistory([]); toast.success("History cleared"); };
  return (
    <div className="cc-glass-panel">
      <div className="cc-section-title"><div><span className="cc-kicker">ON THIS DEVICE</span><h2>Recent transfers</h2></div>{history.length > 0 && <button className="cc-quiet-button" onClick={clear}><Trash2 size={14} /> Clear</button>}</div>
      {history.length === 0 ? (
        <div className="cc-empty-state"><div className="cc-empty-orb"><Clock3 size={24} /></div><h3>No activity yet</h3><p>Your recent sends and retrievals will appear here.</p></div>
      ) : (
        <div className="cc-history-list">{history.map((item, index) => <button key={`${item.code}-${item.action}-${index}`} onClick={() => onRetrieve(item.code)}><span className={`cc-history-icon ${item.action}`} >{item.action === "send" ? <Send size={16} /> : <Download size={16} />}</span><span className="cc-history-copy"><strong>{item.code}</strong><small>{item.preview}</small></span><span className="cc-history-time">{timeAgo(item.ts)}</span><ChevronDown size={15} className="cc-history-arrow" /></button>)}</div>
      )}
    </div>
  );
}

function timeAgo(ts: number) {
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}
