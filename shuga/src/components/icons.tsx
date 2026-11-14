type P = { size?: number };
const base = (size = 22) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
});

export const DropIcon = ({ size }: P) => (<svg {...base(size)}><path d="M12 3.5c3.2 4 6 7.3 6 10.6a6 6 0 0 1-12 0C6 10.8 8.8 7.5 12 3.5Z" /></svg>);
export const BowlIcon = ({ size }: P) => (<svg {...base(size)}><path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z" /><path d="M9 7.5c0-1.2 1-1.7 1-3M13 7.5c0-1.2 1-1.7 1-3" /></svg>);
export const HeartIcon = ({ size }: P) => (<svg {...base(size)}><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" /></svg>);
export const HomeIcon = ({ size }: P) => (<svg {...base(size)}><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z" /></svg>);
export const ChartIcon = ({ size }: P) => (<svg {...base(size)}><path d="M4 19h16" /><path d="M5 15.5 9.5 11l3.5 3 6-7" /></svg>);
export const ShareIcon = ({ size }: P) => (<svg {...base(size)}><path d="M12 15V4M8 7.5 12 3.5l4 4" /><path d="M6 11H5.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18" /></svg>);
export const UserIcon = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>);
export const BackIcon = ({ size }: P) => (<svg {...base(size)}><path d="M15 5l-7 7 7 7" /></svg>);
export const XIcon = ({ size = 18 }: P) => (<svg {...base(size)}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const CheckIcon = ({ size = 14 }: P) => (<svg {...base(size)} strokeWidth={2.4}><path d="M5 12.5 10 17l9-10" /></svg>);
export const ChevronIcon = ({ size = 18 }: P) => (<svg {...base(size)}><path d="M9 5l7 7-7 7" /></svg>);

export const WhatsAppIcon = ({ size = 22 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2c.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
  </svg>
);

export const GoogleLogo = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5Z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7Z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44Z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.4-.4-3.5Z" />
  </svg>
);

export const FacebookLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="currentColor">
    <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z" />
  </svg>
);

/** The Shuga mark: a low sun over a horizon — calm, warm, steady. */
export const SunMark = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 120" aria-hidden>
    <circle cx="60" cy="66" r="34" fill="var(--gold)" opacity="0.92" />
    <rect x="0" y="66" width="120" height="54" fill="var(--bg)" />
    <path d="M14 72h92" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M30 82h60M44 92h32" stroke="var(--ink)" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
