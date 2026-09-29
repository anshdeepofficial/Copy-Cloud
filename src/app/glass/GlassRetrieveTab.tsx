import { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { Archive, ArrowLeft, Copy, Download, ExternalLink, Eye, FileText, FileUp, Film, Search, X } from "lucide-react";
import { toast } from "sonner";
import { addToHistory, fileKind, supabase } from "../../lib/supabase";

type Stage = "input" | "loading" | "result";
type ClipData = { code: string; content: string; type: "text" | "file" };
type FileEntry = { name: string; url: string };

function parseHttpUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? raw : null;
  } catch {
    return null;
  }
}

export function GlassRetrieveTab({ prefillCode }: { prefillCode?: string }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [stage, setStage] = useState<Stage>("input");
  const [result, setResult] = useState<ClipData | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [preview, setPreview] = useState<FileEntry | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (prefillCode?.length === 6) {
      const clean = prefillCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
      setCode(clean.split(""));
      const timer = window.setTimeout(() => void doRetrieve(clean), 350);
      return () => window.clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillCode]);

  const handleKeyInput = (index: number, value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!clean) {
      const next = [...code];
      next[index] = "";
      setCode(next);
      return;
    }
    if (clean.length > 1) {
      const next = [...code];
      for (let offset = 0; offset < clean.length && index + offset < 6; offset += 1) next[index + offset] = clean[offset];
      setCode(next);
      refs.current[Math.min(index + clean.length, 5)]?.focus();
      return;
    }
    const next = [...code];
    next[index] = clean;
    setCode(next);
    if (index < 5) refs.current[index + 1]?.focus();
  };

  const codeStr = code.join("");
  const complete = codeStr.length === 6;

  const doRetrieve = async (override?: string) => {
    const clean = (override || codeStr).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (clean.length !== 6) return toast.error("Enter a valid 6-character code.");
    setStage("loading");
    setFiles([]);
    setResult(null);
    try {
      const { data, error } = await supabase.from("clips").select("*").eq("code", clean).single();
      if (error || !data) {
        toast.error("Code not found or expired.");
        setStage("input");
        return;
      }
      if (data.type === "file") {
        const paths: string[] = JSON.parse(data.content);
        setFiles(paths.map((path) => {
          const name = path.split("-").slice(2).join("-") || path;
          const { data: publicData } = supabase.storage.from("uploads").getPublicUrl(path);
          return { name, url: publicData.publicUrl };
        }));
      }
      setResult({ code: data.code, content: data.content, type: data.type });
      setStage("result");
      addToHistory({
        code: clean,
        action: "retrieve",
        contentType: data.type,
        preview: data.type === "text" ? data.content.slice(0, 40) : `${JSON.parse(data.content).length} file(s)`,
        ts: Date.now(),
      });
      toast.success("Content found!");
    } catch {
      toast.error("Something went wrong.");
      setStage("input");
    }
  };

  const reset = () => {
    setStage("input");
    setCode(["", "", "", "", "", ""]);
    setResult(null);
    setFiles([]);
    setPreview(null);
    window.setTimeout(() => refs.current[0]?.focus(), 100);
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    toast.success("Copied!");
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleZip = async () => {
    setZipping(true);
    try {
      const zip = new JSZip();
      await Promise.all(files.map(async (file) => {
        const response = await fetch(file.url);
        if (!response.ok) throw new Error(`Could not download ${file.name}`);
        zip.file(file.name, await response.blob());
      }));
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `copycloud-${result?.code}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded!");
    } catch {
      toast.error("ZIP failed.");
    } finally {
      setZipping(false);
    }
  };

  const resolvedLink = useMemo(() => (result?.type === "text" ? parseHttpUrl(result.content) : null), [result]);

  if (stage !== "result") {
    return (
      <div className="cc-glass-panel cc-classic-content-panel cc-classic-retrieve">
        <p className="cc-classic-section-label">ENTER PORTAL CODE</p>
        <div className="cc-otp-row">
          {code.map((char, index) => (
            <input
              key={index}
              ref={(element) => { refs.current[index] = element; }}
              type="text"
              maxLength={6}
              value={char}
              onChange={(event) => handleKeyInput(index, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !code[index] && index > 0) refs.current[index - 1]?.focus();
                if (event.key === "Enter") void doRetrieve();
              }}
              onFocus={(event) => event.currentTarget.select()}
              className={char ? "filled" : ""}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              inputMode="text"
              aria-label={`Code character ${index + 1}`}
            />
          ))}
        </div>
        <button className="cc-primary-button cc-classic-submit" onClick={() => void doRetrieve()} disabled={!complete || stage === "loading"}>
          {stage === "loading" ? <><span className="cc-spinner" /> Scanning Cloud…</> : <><Search size={18} /> Find Content</>}
        </button>
        <div className="cc-classic-retrieve-hint">Enter the 6-character code shown on the sending device</div>
      </div>
    );
  }

  return (
    <div className="cc-glass-panel cc-classic-content-panel cc-classic-retrieve-result">
      <div className="cc-classic-result-head">
        <div>
          <div className="cc-classic-result-title"><strong>Content Found</strong><span>{result?.type}</span></div>
          <p>Code: <b>{result?.code}</b></p>
        </div>
        <button onClick={reset}><ArrowLeft size={13} /> Back</button>
      </div>

      {result?.type === "text" && (
        <>
          <div className="cc-classic-text-result">
            <div><FileText size={13} /><span>{result.content.length.toLocaleString()} chars</span></div>
            <pre>{result.content}</pre>
          </div>
          <div className="cc-classic-result-actions">
            <button className="cc-primary-button" onClick={() => void handleCopy()}><Copy size={16} /> {copied ? "Copied!" : "Copy All Text"}</button>
            {resolvedLink && <a href={resolvedLink} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /> Open Link</a>}
          </div>
        </>
      )}

      {result?.type === "file" && (
        <>
          <div className="cc-classic-retrieved-list">
            {files.map((file) => {
              const kind = fileKind(file.name);
              const isImage = kind === "image";
              const isVideo = kind === "video";
              const canPreview = isImage || isVideo;
              return (
                <div className="cc-classic-retrieved-file" key={file.url}>
                  <div className="cc-classic-retrieved-row">
                    <div className="cc-classic-retrieved-icon">
                      {isImage ? <img src={file.url} alt="" loading="lazy" /> : isVideo ? <Film size={16} /> : <FileUp size={16} />}
                    </div>
                    <span>{file.name}</span>
                    {canPreview && <button onClick={() => setPreview(file)}><Eye size={12} /> View</button>}
                    <a href={file.url} target="_blank" rel="noreferrer" download={file.name}><Download size={12} /> Get</a>
                  </div>
                  {isImage && <img className="cc-classic-inline-media" src={file.url} alt={file.name} onClick={() => setPreview(file)} loading="lazy" />}
                  {isVideo && <video className="cc-classic-inline-media" src={file.url} controls preload="metadata" />}
                </div>
              );
            })}
          </div>
          {files.length > 1 && (
            <button className="cc-primary-button cc-classic-submit" onClick={() => void handleZip()} disabled={zipping}>
              {zipping ? <><span className="cc-spinner" /> Building ZIP…</> : <><Archive size={16} /> Download All as ZIP</>}
            </button>
          )}
        </>
      )}

      {preview && (
        <div className="cc-glass-lightbox" onClick={() => setPreview(null)}>
          <button className="cc-glass-lightbox-close" onClick={() => setPreview(null)}><X size={18} /></button>
          <div onClick={(event) => event.stopPropagation()}>
            {fileKind(preview.name) === "image" ? <img src={preview.url} alt={preview.name} /> : <video src={preview.url} controls autoPlay />}
            <div className="cc-glass-lightbox-meta"><span>{preview.name}</span><a href={preview.url} download={preview.name}><Download size={12} /> Download</a></div>
          </div>
        </div>
      )}
    </div>
  );
}
