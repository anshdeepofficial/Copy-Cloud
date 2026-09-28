import { useState } from "react";
import { ChevronDown, Github, Laptop, Link2, ShieldCheck, Sparkles, Zap } from "lucide-react";

export function GlassAboutTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const faqs = [
    ["How does CopyCloud work?", "Send text or files, receive a six-character code, then enter that code on another device."],
    ["How long is content kept?", "Transfers are designed to expire after 24 hours. Recent activity shown in History is stored locally in your browser."],
    ["What is the file limit?", "The current transfer limit is 40 MB total per send."],
    ["Do I need an account?", "No. CopyCloud is designed for no-login cross-device transfer."],
  ];
  return (
    <div className="cc-glass-panel">
      <div className="cc-about-intro"><div className="cc-about-orb"><Sparkles size={25} /></div><span className="cc-kicker">COPYCLOUD</span><h2>Fast transfer, less clutter.</h2><p>CopyCloud focuses on one job: moving text and files between devices without forcing an account, app install or long setup flow.</p></div>
      <div className="cc-feature-grid">
        <Feature icon={Zap} title="Fast handoff" copy="One short code connects the sending and receiving device." />
        <Feature icon={ShieldCheck} title="Temporary by default" copy="Transfers are designed around a 24-hour lifecycle instead of permanent storage." />
        <Feature icon={Laptop} title="Cross-platform" copy="Use a modern browser on desktop, tablet or mobile." />
        <Feature icon={Link2} title="QR friendly" copy="Every successful send gives you a QR-ready retrieval link." />
      </div>
      <div className="cc-faq-list">
        {faqs.map(([question, answer], index) => <button key={question} onClick={() => setOpenFaq(openFaq === index ? null : index)} className={openFaq === index ? "open" : ""}><span>{question}</span><ChevronDown size={16} />{openFaq === index && <p>{answer}</p>}</button>)}
      </div>
      <a className="cc-github-link" href="https://github.com/anshdeepofficial/Copy-Cloud" target="_blank" rel="noreferrer"><Github size={16} /> View CopyCloud on GitHub</a>
    </div>
  );
}

function Feature({ icon: Icon, title, copy }: { icon: typeof Zap; title: string; copy: string }) {
  return <div className="cc-feature-card"><span><Icon size={18} /></span><strong>{title}</strong><p>{copy}</p></div>;
}
