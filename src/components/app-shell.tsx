import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  ClipboardCheck,
  HelpCircle,
  Info,
  LayoutDashboard,
  Settings,
  Sparkles,
  Sun,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "My Desk", Icon: LayoutDashboard },
  { to: "/library", label: "Class Library", Icon: BookOpen },
  { to: "/quizzes", label: "Quick Checks", Icon: ClipboardCheck },
  { to: "/progress", label: "Report Card", Icon: TrendingUp },
  { to: "/questions", label: "My Questions", Icon: HelpCircle },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="app-shell">
      <aside className="shell-sidebar">
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
              <Link key={to} to={to} className={`shell-link ${active ? "active" : ""}`}>
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
          <Link to="/settings" className={`shell-link ${pathname.startsWith("/settings") ? "active" : ""}`}>
            <Settings size={17} /> Settings
          </Link>
          <Link to="/about" className={`shell-link ${pathname.startsWith("/about") ? "active" : ""}`}>
            <Info size={17} /> About
          </Link>
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-header">
          <div className="shell-title">
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
