import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { AppShell } from "../components/app-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AI KYRO" },
      { name: "description", content: "Why AI KYRO replaces the chat box with a classroom you take part in." },
      { property: "og:title", content: "About AI KYRO" },
      { property: "og:description", content: "A metacognitive scaffold: watch, question, and test your thinking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <AppShell title="About">
      <div className="page-stack">
        <section className="panel">
          <header className="panel-head">
            <span className="panel-icon">
              <Info size={18} />
            </span>
            <div>
              <h2>Metacognitive AI Scaffold</h2>
              <p className="muted">Learn · Think · Grow</p>
            </div>
          </header>
          <div className="prose">
            <p>
              Instant answers removed the work that produces understanding. Here the chat box is replaced by a
              classroom: a teacher, a student who asks the basic questions, and a stronger student who pushes for
              depth.
            </p>
            <p>
              You are never only watching. Hints stay hidden until you commit a guess, blanks wait for your intuition,
              and you can step in as the third student at any moment — by typing or by speaking.
            </p>
            <p>
              Afterwards a checkpoint, a delayed retention quiz, and a spoken teach-back measure whether the idea
              actually stayed.
            </p>
          </div>
          <div className="credit-grid">
            <div>
              <strong>Client</strong>
              <span>Dr. Balamurali A R, AI KYRO</span>
            </div>
            <div>
              <strong>Team</strong>
              <span>Aman Jain · Nishil Seth Gupta · Kasak Malhotra · Rajas Agarwal</span>
            </div>
            <div>
              <strong>Course</strong>
              <span>ET 617 · Educational Application Development</span>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
