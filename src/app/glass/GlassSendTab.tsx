import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Check, Clipboard, Copy, FileText, RotateCcw, Trash2, Upload, Video, X } from "lucide-react";
import { toast } from "sonner";
import { addToHistory, formatFileSize, generateCode, supabase } from "../../lib/supabase";

type SendType = "text" | "file";
const MAX_BYTES = 40 * 1024 * 1024;

export function GlassSendTab() {
  const [sendType, setSendType] = useState<SendType>("file");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completedUploads, setCompletedUploads] = useState(0);
  const [success, setSuccess] = useState<{ code: string; type: SendType } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const uploadPercent = files.length ? Math.round((completedUploads / files.length) * 100) : 0;

  const mergeFiles = (incoming: File[]) => {
    setFiles((prev) => {
      const merged = [...prev];
      incoming.forEach((file) => {
        if (!merged.some((current) => current.name === file.name && current.size === file.size && current.lastModified === file.lastModified)) merged.push(file);
      });
      return merged;
    });
  };

  const send = async () => {
    if (sendType === "text" && !text.trim()) return toast.error("Enter some text first.");
    if (sendType === "file" && files.length === 0) return toast.error("Choose at least one file.");
    if (sendType === "file" && totalSize > MAX_BYTES) return toast.error("The total file size cannot exceed 40 MB.");

    setLoading(true);
    setCompletedUploads(0);
    const code = generateCode();
    try {
      let content = text;
      if (sendType === "file") {
        const paths: string[] = [];
        for (let index = 0; index < files.length; index += 1) {
          const file = files[index];
          const path = `${code}-${Math.random().toString(36).slice(2, 6)}-${file.name.replace(/\s/g, "_")}`;
          const { error } = await supabase.storage.from("uploads").upload(path, file);
          if (error) throw error;
          paths.push(path);
          setCompletedUploads(index + 1);
        }
        content = JSON.stringify(paths);
      }

      const { error } = await supabase.from("clips").insert([{ code, content, type: sendType, created_at: new Date().toISOString() }]);
      if (error) throw error;
      addToHistory({ code, action: "send", contentType: sendType, preview: sendType === "text" ? text.slice(0, 40) : `${files.length} file(s)`, ts: Date.now() });
      setSuccess({ code, type: sendType });
      toast.success("Transfer ready");
    } catch (error: any) {
      toast.error(error?.message || "Transfer failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const shareUrl = `${window.location.origin}/?code=${success.code}`;
    return (
      <div className="cc-glass-panel cc-success-panel">
        <div className="cc-success-icon"><Check size={26} /></div>
        <span className="cc-kicker">TRANSFER READY</span>
        <h2>Your secure code is ready</h2>
        <p>Share this code or scan the QR. It expires with the content after 24 hours.</p>
        <div className="cc-code-row">{success.code.split("").map((char, index) => <span key={`${char}-${index}`}>{char}</span>)}</div>
        <div className="cc-qr-wrap"><QRCode value={shareUrl} size={168} bgColor="#ffffff" fgColor="#101114" level="H" /></div>
        <div className="cc-action-row">
          <button className="cc-secondary-button" onClick={async () => { await navigator.clipboard.writeText(shareUrl); toast.success("Link copied"); }}><Copy size={16} /> Copy link</button>
          <button className="cc-primary-button" onClick={() => { setSuccess(null); setText(""); setFiles([]); setCompletedUploads(0); }}><RotateCcw size={16} /> New transfer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-glass-panel">
      <div className="cc-type-switch" role="tablist" aria-label="Send type">
        <button className={sendType === "text" ? "active" : ""} onClick={() => setSendType("text")}><FileText size={15} /> Text</button>
        <button className={sendType === "file" ? "active" : ""} onClick={() => setSendType("file")}><Upload size={15} /> Files</button>
      </div>

      {sendType === "text" ? (
        <div className="cc-text-card">
          <div className="cc-text-toolbar"><span>Paste or type anything</span><button onClick={async () => { try { const clip = await navigator.clipboard.readText(); setText((prev) => prev + clip); } catch { toast.error("Clipboard permission was blocked."); } }}><Clipboard size={14} /> Paste</button></div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Text, links, notes, code snippets…" rows={9} />
          <div className="cc-text-meta"><span>{text.length.toLocaleString()} characters</span><button onClick={() => setText("")} disabled={!text}><Trash2 size={13} /> Clear</button></div>
        </div>
      ) : (
        <>
          <div
            className={`cc-drop-zone ${dragging ? "dragging" : ""}`}
            onClick={() => !loading && fileRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); mergeFiles(Array.from(event.dataTransfer.files)); }}
          >
            <span className="cc-drop-title">Drop your files here</span>
            <div className="cc-upload-orb"><Upload size={28} /></div>
            <p>Drag and drop or click to browse. Any file type is supported up to 40 MB total.</p>
            <input ref={fileRef} type="file" multiple hidden onChange={(event) => { mergeFiles(Array.from(event.currentTarget.files || [])); event.currentTarget.value = ""; }} />
          </div>

          {files.length > 0 && (
            <div className="cc-file-stack">
              {files.map((file, index) => <SelectedFile key={`${file.name}-${file.lastModified}`} file={file} onRemove={() => setFiles((prev) => prev.filter((_, i) => i !== index))} disabled={loading} />)}
              <div className="cc-total-line"><span>{files.length} file{files.length === 1 ? "" : "s"}</span><strong className={totalSize > MAX_BYTES ? "danger" : ""}>{formatFileSize(totalSize)} / 40 MB</strong></div>
              {loading && <div className="cc-progress-wrap"><div className="cc-progress-copy"><span>Uploading {completedUploads} of {files.length}</span><strong>{uploadPercent}%</strong></div><div className="cc-progress-track"><i style={{ width: `${uploadPercent}%` }} /></div></div>}
            </div>
          )}
        </>
      )}

      <div className="cc-action-row cc-panel-actions">
        <button className="cc-secondary-button" onClick={() => { if (!loading) { setText(""); setFiles([]); setCompletedUploads(0); } }} disabled={loading}>Cancel</button>
        <button className="cc-primary-button" onClick={send} disabled={loading || (sendType === "file" ? !files.length || totalSize > MAX_BYTES : !text.trim())}>{loading ? "Uploading…" : "Generate secure code"}</button>
      </div>
    </div>
  );
}

function SelectedFile({ file, onRemove, disabled }: { file: File; onRemove: () => void; disabled: boolean }) {
  const kind = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "other";
  const preview = useMemo(() => (kind === "image" ? URL.createObjectURL(file) : ""), [file, kind]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  return (
    <div className="cc-file-row">
      <div className="cc-file-icon">{preview ? <img src={preview} alt="" /> : kind === "video" ? <Video size={19} /> : <FileText size={19} />}</div>
      <div className="cc-file-copy"><strong>{file.name}</strong><span>{file.type || "File"} · {formatFileSize(file.size)}</span></div>
      <button onClick={onRemove} disabled={disabled} aria-label={`Remove ${file.name}`}><X size={16} /></button>
    </div>
  );
}
