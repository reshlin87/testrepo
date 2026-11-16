"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartIcon, HomeIcon, ShareIcon, UserIcon } from "./icons";

const TABS = [
  { href: "/", label: "Today", Icon: HomeIcon },
  { href: "/insights", label: "Insights", Icon: ChartIcon },
  { href: "/share", label: "Share", Icon: ShareIcon },
  { href: "/settings", label: "You", Icon: UserIcon },
];

export function TabBar() {
  const path = usePathname();
  if (path.startsWith("/log")) return null;
  return (
    <div className="tabbar">
      <nav aria-label="Main">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}>
              <Icon size={23} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
