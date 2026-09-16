import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardCheck, Play, Sparkles, TrendingUp } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { ALL_CONCEPTS, MASTERY, PENDING_QUIZZES } from "../lib/aikyro-data";
import { useLearner } from "../lib/learner-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Desk | AI KYRO" },
      { name: "description", content: "Your learning desk: classes in progress, points earned, and quizzes waiting for you." },
      { property: "og:title", content: "My Desk | AI KYRO" },
      { property: "og:description", content: "Learn by taking part in a classroom discussion instead of reading answers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeskPage,
});

function DeskPage() {
  const { state, ready } = useLearner();
  const due = PENDING_QUIZZES.filter((quiz) => quiz.availableNow && !state.answeredQuizzes.includes(quiz.id));
  const resume = ALL_CONCEPTS[0] ?? { id: "conservation_of_energy", name: "Conservation of Energy" };
  const custom = state.customConcepts;

  return (
    <AppShell title="My Desk">
      <div className="page-stack">
        <section className="panel hero-panel">
          <div>
            <small>Welcome back</small>
            <h2>Ready for class?</h2>
            <p className="muted">
              A teacher and two students will work through a concept with you — and you can interrupt any time.
            </p>
            <Link to="/classroom/$conceptId" params={{ conceptId: resume.id }} className="hero-cta">
              <Play size={15} /> Enter class · {resume.name}
            </Link>
          </div>
          <div className="stat-cluster">
            <div>
              <strong>{ready ? state.points : 120}</strong>
              <span>points</span>
            </div>
            <div>
              <strong>{ready ? state.askedQuestions.length : 0}</strong>
              <span>questions asked</span>
            </div>
            <div>
              <strong>{due.length}</strong>
              <span>checks due</span>
            </div>
          </div>
        </section>

        <div className="two-col">
          <section className="panel">
            <header className="panel-head">
              <span className="panel-icon">
                <TrendingUp size={18} />
              </span>
              <div>
                <h2>In progress</h2>
                <p className="muted">Pick up where the class left off.</p>
              </div>
            </header>
            <div className="mini-list">
              {MASTERY.map((item) => (
                <Link key={item.conceptId} to="/classroom/$conceptId" params={{ conceptId: item.conceptId }} className="mini-row">
                  <span>{item.name}</span>
                  <div className="mini-bar">
                    <i style={{ width: `${item.score}%` }} />
                  </div>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </section>

          <section className="panel">
            <header className="panel-head">
              <span className="panel-icon">
                <ClipboardCheck size={18} />
              </span>
              <div>
                <h2>Waiting for you</h2>
                <p className="muted">Delayed checks are where real retention shows.</p>
              </div>
            </header>
            {due.length === 0 ? (
              <p className="muted">Nothing due right now.</p>
            ) : (
              <div className="mini-list">
                {due.map((quiz) => (
                  <Link key={quiz.id} to="/quizzes" className="mini-row">
                    <span>{quiz.conceptName}</span>
                    <em>{quiz.dueIn}</em>
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="panel">
          <header className="panel-head">
            <span className="panel-icon">
              <Sparkles size={18} />
            </span>
            <div>
              <h2>Your own topics</h2>
              <p className="muted">Type any topic and a full class is built for it.</p>
            </div>
            <Link to="/library" className="head-link">
              Create one <ArrowRight size={14} />
            </Link>
          </header>
          {custom.length === 0 ? (
            <p className="muted">No topics of your own yet.</p>
          ) : (
            <div className="mini-list">
              {custom.map((concept) => (
                <Link key={concept.id} to="/classroom/$conceptId" params={{ conceptId: concept.id }} className="mini-row">
                  <span>{concept.name}</span>
                  <em>yours</em>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
