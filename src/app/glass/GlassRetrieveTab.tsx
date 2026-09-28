import { useEffect, useState } from "react";
import JSZip from "jszip";
import { Copy, Download, ExternalLink, FileArchive, FileText, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";
import { addToHistory, fileKind, supabase } from "../../lib/supabase";

type Retrieved = { type: "text" | "file"; content: string };
type RetrievedFile = { name: string; url: string };

export function GlassRetrieveTab({ prefillCode }: { prefillCode?: string }) {
  const [code, setCode] = useState(prefillCode || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Retrieved | null>(null);
  const [files, setFiles] = useState<RetrievedFile[]>([]);
  const [zipping, setZipping] = useState(false);

  useEffect(() => {
    if (prefillCode) setCode(prefillCode);
  }, [prefillCode]);

  useEffect(() => {
    if (prefillCode?.length === 6) void retrieve(prefillCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillCode]);

  const retrieve = async (forcedCode?: string) => {
    const clean = (forcedCode || code).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (clean.length !== 6) return toast.error("Enter the full 6-character code.");
    setLoading(true);
    setResult(null);
    setFiles([]);
    try {
      const { data, error } = await supabase.from("clips").select("content,type,created_at").eq("code", clean).maybeSingle();
      if (error) throw error;
      if (!data) return toast.error("Code not found or already expired.");
      const createdAt = new Date(data.created_at).getTime();
      if (Number.isFinite(createdAt) && Date.now() - createdAt > 24 * 60 * 60 * 1000) return toast.error("This transfer has expired.");
      const typed: Retrieved = { type: data.type, content: data.content };
      setResult(typed);
      if (typed.type === "file") {
        const paths: string[] = JSON.parse(typed.content);
        setFiles(paths.map((path) => {
          const name = path.split("-").slice(2).join("-") || path;
          const { data: publicData } = supabase.storage.from("uploads").getPublicUrl(path);
          return { name, url: publicData.publicUrl };
        }));
      }
      addToHistory({ code: clean, action: "retrieve", contentType: typed.type, preview: typed.type === "text" ? typed.content.slice(0, 40) : "Retrieved files", ts: Date.now() });
      setCode(clean);
    } catch (error: any) {
      toast.error(error?.message || "Could not retrieve this transfer.");
    } finally {
      setLoading(false);
    }
  };

  const downloadZip = async () => {
    setZipping(true);
    try {
      const zip = new JSZip();
      for (const file of files) {
        const response = await fetch(file.url);
        if (!response.ok) throw new Error(`Could not fetch ${file.name}`);
        zip.file(file.name, await response.blob());
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `copycloud-${code}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error?.message || "ZIP download failed.");
    } finally {
      setZipping(false);
    }
  };

  const maybeUrl = result?.type === "text" && /^https?:\/\/\S+$/i.test(result.content.trim()) ? result.content.trim() : null;

  return (
    <div className="cc-glass-panel">
      <div className="cc-retrieve-head"><span className="cc-kicker">ENTER YOUR CODE</span><h2>Open a transfer</h2><p>Type the six characters exactly as shown on the sending device.</p></div>
      <div className="cc-code-input-wrap">
        <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} onKeyDown={(event) => { if (event.key === "Enter") void retrieve(); }} maxLength={6} autoCapitalize="characters" spellCheck={false} placeholder="A3K9Z7" />
        <button className="cc-primary-button" onClick={() => void retrieve()} disabled={loading || code.length !== 6}>{loading ? "Checking…" : "Retrieve"}</button>
      </div>

      {result?.type === "text" && (
        <div className="cc-result-card">
          <div className="cc-result-head"><span><FileText size={16} /> Text received</span><button onClick={async () => { await navigator.clipboard.writeText(result.content); toast.success("Copied"); }}><Copy size={14} /> Copy</button></div>
          <pre>{result.content}</pre>
          {maybeUrl && <a className="cc-inline-link" href={maybeUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Open link</a>}
        </div>
      )}

      {result?.type === "file" && (
        <div className="cc-result-card">
          <div className="cc-result-head"><span><Download size={16} /> {files.length} file{files.length === 1 ? "" : "s"} received</span>{files.length > 1 && <button onClick={downloadZip} disabled={zipping}><FileArchive size={14} /> {zipping ? "Building ZIP…" : "ZIP all"}</button>}</div>
          <div className="cc-retrieved-files">
            {files.map((file) => <RetrievedFileCard key={file.url} file={file} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function RetrievedFileCard({ file }: { file: RetrievedFile }) {
  const kind = fileKind(file.name);
  return (
    <div className="cc-retrieved-file">
      <div className="cc-file-icon">{kind === "image" ? <ImageIcon size={19} /> : kind === "video" ? <Video size={19} /> : <FileText size={19} />}</div>
      <div className="cc-file-copy"><strong>{file.name}</strong><span>{kind === "image" ? "Image" : kind === "video" ? "Video" : "File"}</span></div>
      <a href={file.url} target="_blank" rel="noreferrer" download={file.name}><Download size={15} /> Get</a>
      {kind === "image" && <img className="cc-inline-preview" src={file.url} alt={file.name} loading="lazy" />}
      {kind === "video" && <video className="cc-inline-preview" src={file.url} controls preload="metadata" />}
    </div>
  );
}
