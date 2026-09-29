import { useState } from "react";
import { Briefcase, ChevronDown, Github, Globe, Instagram, Linkedin, Shield, Zap } from "lucide-react";

const features = [
  { icon: Zap, title: "Zero-Friction Transit", desc: "No accounts, no pairing, no installs. A 6-digit code bridges any two devices in seconds." },
  { icon: Shield, title: "Ephemeral by Design", desc: "Content auto-deletes after 24 hours. No profiles and no permanent transfer history." },
];

const faq = [
  { q: "How does the code work?", a: "Upload content → get a 6-char code. Enter it on any other device to retrieve. The code expires with the data after 24 hours." },
  { q: "Is my data encrypted?", a: "All transfers use HTTPS. Data is stored in isolated Supabase storage and is designed to be purged after the transfer window." },
  { q: "File size limits?", a: "Up to 40 MB per transfer. Text transfers use the same short-code flow." },
  { q: "Does it work cross-platform?", a: "Any device with a modern browser — Windows, Mac, Linux, Android or iOS. No installation needed." },
];

const links = [
  { icon: Briefcase, label: "Portfolio", href: "https://anshdeepofficial.vercel.app/" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/itsanshdeepofficial/" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/anshdeep_officiall/" },
  { icon: Github, label: "GitHub", href: "https://github.com/anshdeepofficial/" },
];

export function GlassAboutTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="cc-glass-panel cc-classic-content-panel cc-classic-about">
      <div className="cc-classic-about-brand">
        <div><Globe size={24} /></div>
        <strong>Copy Cloud</strong>
        <span>v3.0 · EPHEMERAL TRANSIT PLATFORM</span>
      </div>

      <div className="cc-classic-about-features">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title}>
            <span><Icon size={17} /></span>
            <section><strong>{title}</strong><p>{desc}</p></section>
          </div>
        ))}
      </div>

      <p className="cc-classic-about-label">FAQ</p>
      <div className="cc-classic-about-faq">
        {faq.map((item, index) => (
          <button key={item.q} className={openFaq === index ? "open" : ""} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
            <span>{item.q}</span><ChevronDown size={15} />
            {openFaq === index && <p>{item.a}</p>}
          </button>
        ))}
      </div>

      <div className="cc-classic-about-connect">
        <p>CONNECT</p>
        <div>
          {links.map(({ icon: Icon, label, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer"><Icon size={14} /> {label}</a>
          ))}
        </div>
      </div>

      <div className="cc-classic-about-footer">
        <p>copycloud.me@outlook.com · Punjab, India</p>
        <p>© 2026 Copy Cloud · Ephemeral Transfer Systems</p>
      </div>
    </div>
  );
}
