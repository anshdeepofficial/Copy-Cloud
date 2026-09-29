import { useState } from "react";
import { Github, Instagram, Linkedin } from "lucide-react";
import {
  GlassBoltIcon,
  GlassChevronIcon,
  GlassGlobeIcon,
  GlassShieldIcon,
  GlassWorkIcon,
  type GlassIconProps,
} from "./GlassIcons";

type IconComponent = (props: GlassIconProps) => JSX.Element;

const features: { icon: IconComponent; title: string; desc: string }[] = [
  { icon: GlassBoltIcon, title: "Zero-Friction Transit", desc: "No accounts, no pairing, no installs. A 6-digit code bridges any two devices in seconds." },
  { icon: GlassShieldIcon, title: "Ephemeral by Design", desc: "Content auto-deletes after 24 hours. No profiles and no permanent transfer history." },
];

const faq = [
  { q: "How does the code work?", a: "Upload content → get a 6-char code. Enter it on any other device to retrieve. The code expires with the data after 24 hours." },
  { q: "Is my data encrypted?", a: "All transfers use HTTPS. Data is stored in isolated Supabase storage and is designed to be purged after the transfer window." },
  { q: "File size limits?", a: "Up to 40 MB per transfer. Text transfers use the same short-code flow." },
  { q: "Does it work cross-platform?", a: "Any device with a modern browser — Windows, Mac, Linux, Android or iOS. No installation needed." },
];

const links = [
  { kind: "glass", icon: GlassWorkIcon, label: "Portfolio", href: "https://anshdeepofficial.vercel.app/" },
  { kind: "brand", icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/itsanshdeepofficial/" },
  { kind: "brand", icon: Instagram, label: "Instagram", href: "https://www.instagram.com/anshdeep_officiall/" },
  { kind: "brand", icon: Github, label: "GitHub", href: "https://github.com/anshdeepofficial/" },
] as const;

export function GlassAboutTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="cc-glass-panel cc-classic-content-panel cc-classic-about">
      <div className="cc-classic-about-brand">
        <div><GlassGlobeIcon size={27} /></div>
        <strong>Copy Cloud</strong>
        <span>v3.0 · EPHEMERAL TRANSIT PLATFORM</span>
      </div>

      <div className="cc-classic-about-features">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title}>
            <span><Icon size={19} /></span>
            <section><strong>{title}</strong><p>{desc}</p></section>
          </div>
        ))}
      </div>

      <p className="cc-classic-about-label">FAQ</p>
      <div className="cc-classic-about-faq">
        {faq.map((item, index) => (
          <button key={item.q} className={openFaq === index ? "open" : ""} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
            <span>{item.q}</span><GlassChevronIcon size={19} />
            {openFaq === index && <p>{item.a}</p>}
          </button>
        ))}
      </div>

      <div className="cc-classic-about-connect">
        <p>CONNECT</p>
        <div>
          {links.map(({ kind, icon: Icon, label, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer">
              {kind === "glass" ? <Icon size={17} /> : <Icon size={16} />}
              {label}
            </a>
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
