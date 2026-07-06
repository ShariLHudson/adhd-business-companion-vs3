"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

type NavItem = {
  id: string;
  label: string;
  href: string;
  placeholder?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: "studio", label: "Founder Studio", href: FOUNDER_STUDIO_BASE },
  { id: "recent", label: "Recent", href: `${FOUNDER_STUDIO_BASE}/recent`, placeholder: true },
  { id: "favorites", label: "Favorites", href: `${FOUNDER_STUDIO_BASE}/favorites`, placeholder: true },
  { id: "settings", label: "Settings", href: `${FOUNDER_STUDIO_BASE}/settings` },
];

function isActive(pathname: string, href: string): boolean {
  if (href === FOUNDER_STUDIO_BASE) {
    return pathname === FOUNDER_STUDIO_BASE;
  }
  return pathname.startsWith(href);
}

export function FounderSideNav() {
  const pathname = usePathname();

  return (
    <nav className="founder-side-nav" aria-label="Founder navigation">
      <p className="founder-side-nav__brand">Executive Office</p>
      <ul className="founder-side-nav__list">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={`founder-side-nav__link${isActive(pathname, item.href) ? " founder-side-nav__link--active" : ""}${item.placeholder ? " founder-side-nav__link--placeholder" : ""}`}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
              {item.placeholder ? (
                <span className="founder-side-nav__soon">Soon</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
