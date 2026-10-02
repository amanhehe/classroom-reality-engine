import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  ClipboardCheck,
  HelpCircle,
  Info,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  Sun,
  TrendingUp,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "./ui/button";

const NAV = [
  { to: "/", label: "My Desk", Icon: LayoutDashboard },
  { to: "/library", label: "Class Library", Icon: BookOpen },
  { to: "/quizzes", label: "Quick Checks", Icon: ClipboardCheck },
  { to: "/progress", label: "Report Card", Icon: TrendingUp },
  { to: "/questions", label: "My Questions", Icon: HelpCircle },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      {menuOpen && <div className="shell-scrim" aria-hidden="true" onClick={() => setMenuOpen(false)} />}
      <aside className={`shell-sidebar ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="shell-brand">
          <span className="shell-brand-mark">
            <Sun size={20} />
          </span>
          <span>
            <strong>AI KYRO</strong>
            <small>Learn · Think · Grow</small>
          </span>
        </Link>

        <div className="shell-room">
          <span>
            <BookOpen size={16} />
          </span>
          <div>
            <strong>Room 617</strong>
            <small>Your learning space</small>
          </div>
        </div>

        <nav className="shell-nav" aria-label="Main navigation">
          {NAV.map(({ to, label, Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} className={`shell-link ${active ? "active" : ""}`}>
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="shell-note">
          <p>
            Small steps
            <br />
            build big ideas.
          </p>
          <span>✦</span>
        </div>

        <div className="shell-footer-links">
          <Link to="/settings" onClick={() => setMenuOpen(false)} className={`shell-link ${pathname.startsWith("/settings") ? "active" : ""}`}>
            <Settings size={17} /> Settings
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className={`shell-link ${pathname.startsWith("/about") ? "active" : ""}`}>
            <Info size={17} /> About
          </Link>
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-header">
          <div className="shell-title">
            <Button
              variant="ghost"
              size="icon"
              className="shell-menu-button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
            <span>
              <Sun size={14} />
            </span>
            {title}
          </div>
          <div className="shell-header-right">
            <span className="shell-cheer">
              <Sparkles size={13} /> Keep going!
            </span>
            <div className="shell-user">
              <span>K</span>
              <div>
                <strong>Student</strong>
                <small>120 points</small>
              </div>
            </div>
          </div>
        </header>
        <main className="shell-content">{children}</main>
      </div>
    </div>
  );
}
