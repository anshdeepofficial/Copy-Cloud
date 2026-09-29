import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { addToHistory, formatFileSize, generateCode, supabase } from "../../lib/supabase";
import {
  GlassBoltIcon,
  GlassCheckIcon,
  GlassCloseIcon,
  GlassCopyIcon,
  GlassFilesIcon,
  GlassPasteIcon,
  GlassRefreshIcon,
  GlassTextIcon,
  GlassTrashIcon,
  GlassUploadIcon,
  GlassVideoIcon,
} from "./GlassIcons";

type SendType = "text" | "file";
const MAX_BYTES = 40 * 1024 * 1024;

export function GlassSendTab() {
  const [sendType, setSendType] = useState<SendType>("text");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completedUploads, setCompletedUploads] = useState(0);
  const [success, setSuccess] = useState<{ code: string; type: SendType } | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const uploadPercent = files.length ? Math.round((completedUploads / files.length) * 100) : 0;

  const previewUrl = useMemo(() => (previewFile ? URL.createObjectURL(previewFile) : ""), [previewFile]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

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
    if (sendType === "text" && !text.trim()) return toast.error("Enter some text.");
    if (sendType === "file" && files.length === 0) return toast.error("Select at least one file.");
    if (sendType === "file" && totalSize > MAX_BYTES) return toast.error("Exceeds 40 MB limit.");

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
    } catch (error: any) {
      toast.error(error?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const shareUrl = `${window.location.origin}/?code=${success.code}`;
    return (
      <div className="cc-glass-panel cc-success-panel cc-classic-content-panel">
        <div className="cc-success-icon"><GlassCheckIcon size={26} /></div>
        <h2>Portal Created</h2>
        <p>Share this code — it expires in 24 hours</p>
        <div className="cc-code-row">{success.code.split("").map((char, index) => <span key={`${char}-${index}`}>{char}</span>)}</div>
        <div className="cc-qr-wrap"><QRCode value={shareUrl} size={180} bgColor="#ffffff" fgColor="#101114" level="H" /></div>
        <div className="cc-action-row">
          <button className="cc-secondary-button" onClick={async () => { await navigator.clipboard.writeText(shareUrl); toast.success("Link copied!"); }}><GlassCopyIcon size={15} /> Copy Link</button>
          <button className="cc-primary-button" onClick={() => { setSuccess(null); setText(""); setFiles([]); setCompletedUploads(0); setSendType("text"); }}><GlassRefreshIcon size={15} /> New Transfer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cc-glass-panel cc-classic-content-panel">
      <div className="cc-classic-send-toggle cc-iconly-actions" role="tablist" aria-label="Send type">
        <button className={sendType === "text" ? "active" : ""} onClick={() => setSendType("text")}><GlassTextIcon size={17} /> Text / Code</button>
        <button className={sendType === "file" ? "active" : ""} onClick={() => setSendType("file")}><GlassFilesIcon size={17} /> Files</button>
      </div>

      {sendType === "text" ? (
        <div className="cc-classic-editor">
          <div className="cc-classic-editor-toolbar">
            <span>✦ SECURE EDITOR</span>
            <div>
              <button onClick={async () => { try { const clip = await navigator.clipboard.readText(); setText((prev) => prev + clip); } catch { toast.error("Use Ctrl+V"); } }}><GlassPasteIcon size={15} /> Paste</button>
              <button onClick={() => setText("")} disabled={!text}><GlassTrashIcon size={15} /> Clear</button>
            </div>
          </div>
          <div className="cc-classic-editor-body">
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste text, API keys, code snippets, links…" rows={8} spellCheck={false} />
            <span className="cc-classic-char-count">{text.length.toLocaleString()} chars</span>
          </div>
        </div>
      ) : (
        <div className="cc-classic-file-section">
          <div
            className={`cc-classic-file-drop ${dragging ? "dragging" : ""} ${files.length ? "has-files" : ""}`}
            onClick={() => !loading && fileRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); mergeFiles(Array.from(event.dataTransfer.files)); }}
          >
            {files.length === 0 ? (
              <div className="cc-classic-drop-empty">
                <div className="cc-classic-drop-icon"><GlassUploadIcon size={26} /></div>
                <p>Drop files or <span>click to browse</span></p>
                <small>Max 40 MB</small>
              </div>
            ) : (
              <div className="cc-classic-file-list">
                {files.map((file, index) => <SelectedFile key={`${file.name}-${file.lastModified}`} file={file} onPreview={() => setPreviewFile(file)} onRemove={() => setFiles((prev) => prev.filter((_, i) => i !== index))} disabled={loading} />)}
                <button className="cc-add-more" onClick={(event) => { event.stopPropagation(); fileRef.current?.click(); }}>+ Add more files</button>
              </div>
            )}
            <input ref={fileRef} type="file" multiple hidden onChange={(event) => { mergeFiles(Array.from(event.currentTarget.files || [])); event.currentTarget.value = ""; }} />
          </div>
          {files.length > 0 && (
            <div className="cc-total-line"><span>{files.length} file{files.length === 1 ? "" : "s"}</span><strong className={totalSize > MAX_BYTES ? "danger" : ""}>{formatFileSize(totalSize)} / 40 MB</strong></div>
          )}
          {loading && files.length > 0 && (
            <div className="cc-progress-wrap"><div className="cc-progress-copy"><span>Uploading {completedUploads} of {files.length}</span><strong>{uploadPercent}%</strong></div><div className="cc-progress-track"><i style={{ width: `${uploadPercent}%` }} /></div></div>
          )}
        </div>
      )}

      <button className="cc-primary-button cc-classic-submit" onClick={send} disabled={loading || (sendType === "file" ? !files.length || totalSize > MAX_BYTES : !text.trim())}>
        {loading ? "Generating Portal…" : <><GlassBoltIcon size={20} /> Generate Transfer Code</>}
      </button>

      {previewFile && (
        <div className="cc-glass-lightbox" onClick={() => setPreviewFile(null)}>
          <button className="cc-glass-lightbox-close" onClick={() => setPreviewFile(null)}><GlassCloseIcon size={20} /></button>
          <div onClick={(event) => event.stopPropagation()}>
            {previewFile.type.startsWith("image/") ? <img src={previewUrl} alt={previewFile.name} />
              : previewFile.type.startsWith("video/") ? <video src={previewUrl} controls autoPlay />
              : previewFile.type.startsWith("audio/") ? <audio src={previewUrl} controls />
              : <iframe src={previewUrl} title={previewFile.name} />}
            <div className="cc-glass-lightbox-meta"><span>{previewFile.name}</span><a href={previewUrl} download={previewFile.name}><GlassUploadIcon size={15} /> Download</a></div>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectedFile({ file, onPreview, onRemove, disabled }: { file: File; onPreview: () => void; onRemove: () => void; disabled: boolean }) {
  const kind = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "other";
  const preview = useMemo(() => ((kind === "image" || kind === "video") ? URL.createObjectURL(file) : ""), [file, kind]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  return (
    <div className="cc-classic-selected-file" onClick={(event) => event.stopPropagation()}>
      <div className="cc-classic-selected-thumb">{kind === "image" ? <img src={preview} alt="" /> : kind === "video" ? <video src={preview} muted /> : <GlassTextIcon size={17} />}</div>
      <span className="cc-classic-selected-name">{file.name}</span>
      <small>{formatFileSize(file.size)}</small>
      <button onClick={onPreview} aria-label={`Preview ${file.name}`}><GlassTextIcon size={16} /></button>
      <button onClick={onRemove} disabled={disabled} aria-label={`Remove ${file.name}`}><GlassCloseIcon size={16} /></button>
    </div>
  );
}
