import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Sparkles, TrendingUp } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { BADGES, MASTERY, OPEN_DOUBTS } from "../lib/aikyro-data";
import { useLearner } from "../lib/learner-store";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Report Card | AI KYRO" },
      { name: "description", content: "See mastery per concept, points, badges, and the gaps still open in your doubt log." },
      { property: "og:title", content: "Report Card | AI KYRO" },
      { property: "og:description", content: "Mastery, points, badges, and open doubts in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgressPage,
});

const STATE_LABEL: Record<string, string> = {
  retained: "Retained",
  learning: "Still forming",
  new: "Just started",
};

function ProgressPage() {
  const { state } = useLearner();
  const retained = MASTERY.filter((m) => m.state === "retained").length;
  const percent = Math.round((retained / MASTERY.length) * 100);

  return (
    <AppShell title="Report Card">
      <div className="page-stack">
        <section className="panel journey">
          <div className="ring" style={{ ["--value" as string]: `${percent}%` }}>
            <strong>{percent}%</strong>
            <span>retained</span>
          </div>
          <div>
            <h2>Progress, not perfection</h2>
            <p className="muted">
              {retained} of {MASTERY.length} concepts have survived a delayed check. {state.points} points earned so far.
            </p>
            <div className="badge-row">
              {BADGES.map((badge) => (
                <span key={badge.code} className="badge-chip">
                  <span aria-hidden="true">{badge.emoji}</span> {badge.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <header className="panel-head">
            <span className="panel-icon">
              <TrendingUp size={18} />
            </span>
            <div>
              <h2>Mastery per concept</h2>
              <p className="muted">Measured from checkpoints and delayed quizzes, not from time spent.</p>
            </div>
          </header>
          <div className="mastery-list">
            {MASTERY.map((item) => (
              <div key={item.conceptId} className="mastery-row">
                <div>
                  <strong>{item.name}</strong>
                  <small>{STATE_LABEL[item.state]}</small>
                </div>
                <div className="mastery-bar">
                  <span style={{ width: `${item.score}%` }} />
                </div>
                <em>{item.score}%</em>
                <Link to="/classroom/$conceptId" params={{ conceptId: item.conceptId }}>
                  Revisit
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <header className="panel-head">
            <span className="panel-icon warn">
              <AlertCircle size={18} />
            </span>
            <div>
              <h2>Doubt log</h2>
              <p className="muted">Gaps the class noticed in your answers. These drive your next quiz.</p>
            </div>
          </header>
          {OPEN_DOUBTS.length ? (
            <div className="doubt-list">
              {OPEN_DOUBTS.map((doubt) => (
                <div key={doubt.id} className="doubt-row">
                  <strong>{doubt.conceptName}</strong>
                  <p>{doubt.misconception}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">
              <Sparkles size={13} /> Nothing open right now.
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
